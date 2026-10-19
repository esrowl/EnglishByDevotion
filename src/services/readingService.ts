import type { ReadingItem } from '../types/contentSources';

// Unchanged original English extracts, obtained via Gutenberg's recommended rsync.
const rights = 'Original English text: public domain in the US. Author died more than 70 years ago; Turkish life + 70 term has expired (Law 5846, Article 27). Assessment covers Turkey and the US, not all jurisdictions. Project Gutenberg source attribution and license are retained.';
export const readingCollection: ReadingItem[] = [
  {
    id: 'gutenberg-11-opening', title: 'Down the Rabbit-Hole', author: 'Lewis Carroll (1832–1898)',
    difficulty: 'Estimated: intermediate · longer sentences',
    text: 'Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, “and what is the use of a book,” thought Alice “without pictures or conversations?”\n\nSo she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.',
    credit: { source: 'gutenberg', id: '11', url: 'https://www.gutenberg.org/ebooks/11', author: 'Lewis Carroll', license: 'Public-domain original text; Project Gutenberg terms', licenseUrl: 'https://www.gutenberg.org/policy/license.html' }, rights,
  },
  {
    id: 'gutenberg-514-opening', title: 'A Winter Evening · Little Women', author: 'Louisa May Alcott (1832–1888)',
    difficulty: 'Estimated: intermediate · conversational English',
    text: '“Christmas won’t be Christmas without any presents,” grumbled Jo, lying on the rug.\n\n“It’s so dreadful to be poor!” sighed Meg, looking down at her old dress.\n\n“I don’t think it’s fair for some girls to have plenty of pretty things, and other girls nothing at all,” added little Amy, with an injured sniff.\n\n“We’ve got Father and Mother, and each other,” said Beth contentedly from her corner.\n\nThe four young faces on which the firelight shone brightened at the cheerful words, but darkened again as Jo said sadly, “We haven’t got Father, and shall not have him for a long time.” She didn’t say “perhaps never,” but each silently added it, thinking of Father far away, where the fighting was.',
    credit: { source: 'gutenberg', id: '514', url: 'https://www.gutenberg.org/ebooks/514', author: 'Louisa May Alcott', license: 'Public-domain original text; Project Gutenberg terms', licenseUrl: 'https://www.gutenberg.org/policy/license.html' }, rights,
  },
];
export function getReadingCollection(): ReadingItem[] { return readingCollection.filter(item => !!item.text.trim()); }
