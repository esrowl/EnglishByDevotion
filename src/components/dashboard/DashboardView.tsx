import type {VocabularyItem} from '../../types/vocabulary';
import type {NavTab} from '../layout/Sidebar';
import {WireframeGlobe} from '../common/WireframeGlobe';
import {CyberPortrait} from '../common/CyberPortrait';
import {CyberneticOverlay} from '../common/CyberneticOverlay';
interface DashboardViewProps {
 vocabulary:VocabularyItem[];learnedTodayCount:number;reviewedTodayCount:number;
 onNavigate:(tab:NavTab)=>void;onOpenDetail:(item:VocabularyItem)=>void;
 onOpenAddModal:()=>void;onResetSeedData:()=>void;
}
export function DashboardView({onNavigate}:DashboardViewProps){
 return <section className="quiet-home">
  <div className="quiet-home-header">
    <div className="cyber-hero-art" aria-hidden="true"><WireframeGlobe/><CyberPortrait/><CyberneticOverlay/></div>
    <div className="quiet-home-header-copy"><span className="quiet-home-label">PERSONAL LEARNING SYSTEM · BY ESRA</span>
    <h1>EnglishBy<wbr/>Devotion</h1><p>Small steps. A larger language.</p></div>
  </div>
  <button className="retro-btn-teal quiet-practice" onClick={()=>onNavigate('daily')}>▶ Practice Now</button>
  <p className="quiet-home-note">Your library, lessons and readings are in the sidebar.</p>
 </section>;
}
