import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {evaluateLanguage,translateSense} from '../scripts/server/languageFeedback.mjs';

// Protocol/error-contract tests only. This is NOT a real language-model quality test.
const checks=[];async function check(name,fn){await fn();checks.push(name);console.log('PASS',name);}
let body={category:'acceptable',explanation:'A valid alternative is accepted.',suggestion:''},calls=0;
const server=createServer(async(req,res)=>{calls++;let input='';for await(const chunk of req)input+=chunk;const parsed=JSON.parse(input);assert.equal(parsed.stream,false);assert.equal(parsed.keep_alive,0);assert.equal(parsed.format,'json');res.setHeader('Content-Type','application/json');res.end(JSON.stringify({message:{content:JSON.stringify(body)}}));});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const config={model:'contract-fixture-not-real-model',endpoint:`http://127.0.0.1:${server.address().port}`};
try{
 await check('unconfigured optional model fails clearly without installing or starting anything',async()=>{await assert.rejects(()=>evaluateLanguage({questionId:'lex-v1-deteriorate-construction',answer:'An alternative.'},{model:'',endpoint:config.endpoint}),/not configured/);});
 await check('remote endpoint is rejected to prevent unintended data disclosure',async()=>{await assert.rejects(()=>evaluateLanguage({questionId:'lex-v1-deteriorate-construction',answer:'A sentence.'},{...config,endpoint:'https://example.com'}),/local/);});
 await check('objective questions cannot be regraded by an AI endpoint',async()=>{await assert.rejects(()=>evaluateLanguage({questionId:'lex-v1-take-collocation',answer:'make'},config),/Invalid/);});
 await check('structured acceptable alternative feedback and provenance are retained',async()=>{const r=await evaluateLanguage({questionId:'lex-v1-deteriorate-construction',answer:'Air quality is deteriorating.'},config);assert.equal(r.category,'acceptable');assert.equal(r.model,config.model);assert.ok(r.generatedAt);});
 await check('same model/question/answer uses cached feedback without repeat inference',async()=>{const before=calls;await evaluateLanguage({questionId:'lex-v1-deteriorate-construction',answer:'Air quality is deteriorating.'},config);assert.equal(calls,before);});
 for(const category of ['incorrect','unnatural','inappropriate','minor_style','uncertain'])await check(category+' feedback is supported without reducing it to binary grading',async()=>{body={category,explanation:'Fixture explanation for contract validation.',suggestion:'A possible improvement.'};const r=await evaluateLanguage({questionId:'lex-v1-deteriorate-construction',answer:'Contract '+category},config);assert.equal(r.category,category);});
 await check('grammar original production reuses the local advisory adapter without objective grading',async()=>{body={category:'acceptable',explanation:'A valid alternative construction.',suggestion:''};const r=await evaluateLanguage({grammarLessonId:'mixed-inverted-conditionals',answer:'Had I left earlier, I would be home now.'},config);assert.equal(r.category,'acceptable');assert.equal(r.model,config.model);assert.equal('correct' in r,false);});
 await check('unknown grammar lessons cannot send arbitrary tasks to the model',async()=>{await assert.rejects(()=>evaluateLanguage({grammarLessonId:'not-a-lesson',answer:'A response.'},config),/Invalid/);});
 await check('invalid model schema is rejected, not treated as a successful grade',async()=>{body={category:'excellent',explanation:5};await assert.rejects(()=>evaluateLanguage({questionId:'lex-v1-deteriorate-construction',answer:'Invalid schema test.'},config),/invalid feedback/);});
 await check('translation fallback remains marked AI-generated and tied to one English sense',async()=>{body={turkish:['hafifletmek','azaltmak']};const input={word:'alleviate',partOfSpeech:'verb',sense:'make less severe'};const r=await translateSense(input,config);assert.equal(r.status,'ai_generated');assert.equal(r.sense,input.sense);assert.equal(r.partOfSpeech,'verb');assert.deepEqual(r.turkish,body.turkish);});
 await check('invalid translation output is not persisted or cached as a success',async()=>{body={turkish:[7]};await assert.rejects(()=>translateSense({word:'test',partOfSpeech:'verb',sense:'test malformed output'},config),/Invalid model translation/);});
 console.log(JSON.stringify({total:checks.length,failed:0,mode:'protocol-fixture-only',checks},null,2));
}finally{await new Promise(resolve=>server.close(resolve));}
