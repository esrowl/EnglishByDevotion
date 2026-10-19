import type { SourceCredit } from '../../types/contentSources';
import {safeUrl} from '../../services/contentHttp';

export function SourceAttribution({ credit }: { credit?: SourceCredit }) {
  if (!credit) return null;
  return <small className="source-credit block text-sm leading-normal mt-2">
    <a href={safeUrl(credit.url)} target="_blank" rel="noreferrer" className="underline">{credit.source} {credit.id ? `#${credit.id}` : ''}</a>
    {credit.author && ` · ${credit.author}`}
    {credit.license && <> · <a href={safeUrl(credit.licenseUrl || credit.url)} target="_blank" rel="noreferrer" className="underline">{credit.license}</a></>}
  </small>;
}
