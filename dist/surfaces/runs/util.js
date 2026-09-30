/** W03-RUNS shared presentation primitives (escape, direction isolation, tone mapping, icons). */
export const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
/** Direction isolation for technical tokens (ids, digests, addresses, protocols). Never mix runs unguarded. */
export const ltr=value=>`<bdi dir="ltr">${esc(value)}</bdi>`;
export const stateTone=value=>['RUNNING','READY','PASS','HEALTHY','CONNECTED','DONE','ACTIVE','UP'].includes(String(value))?'success':['BLOCKED','FAILED','DISCONNECTED','DOWN'].includes(String(value))?'danger':['PAUSED','WARNING','ADVISORY','LOCKED','MEDIUM'].includes(String(value))?'warning':String(value)==='High'?'danger':String(value)==='Medium'?'warning':String(value)==='Low'?'success':'neutral';
export const sevTone=sev=>sev==='High'?'danger':sev==='Medium'?'warning':'success';
export const pill=(label,tone,flat=false)=>`<span class="runs-pill" data-tone="${tone}"${flat?' data-flat':''}>${esc(label)}</span>`;
export const tag=(label,tone)=>`<span class="runs-tag" data-tone="${tone}">${esc(label)}</span>`;

const P={
  check:'M13.2 4.6 6 11.8 2.8 8.6',alert:'M8 2.6 1.6 13.4h12.8L8 2.6ZM8 6.6v3.1M8 11.4h.01',
  info:'M8 14.4A6.4 6.4 0 1 0 8 1.6a6.4 6.4 0 0 0 0 12.8ZM8 7.4v3.4M8 5.2h.01',
  lock:'M4.4 7.2V5.4a3.6 3.6 0 0 1 7.2 0v1.8M3.4 7.2h9.2v6.2H3.4V7.2Z',
  play:'M5 3.4 12.4 8 5 12.6V3.4Z',pause:'M5.6 3.6v8.8M10.4 3.6v8.8',
  stop:'M4 4h8v8H4z',camera:'M2.6 5.4h2.4l1-1.6h4l1 1.6h2.4v7.2H2.6V5.4ZM8 9.9a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8Z',
  terminal:'M2.4 3.4h11.2v9.2H2.4V3.4ZM4.8 6.6 6.9 8.4 4.8 10.2M8.4 10.6h3',
  list:'M5 4.4h8.4M5 8h8.4M5 11.6h8.4M2.6 4.4h.01M2.6 8h.01M2.6 11.6h.01',
  tasks:'M3 4.6l1.4 1.4 2.4-2.6M3 9.6l1.4 1.4 2.4-2.6M3 13.4h9.6M9.4 4.6h4M9.4 9.6h4',
  box:'M8 2.2 14 5.2v5.6L8 13.8 2 10.8V5.2L8 2.2ZM2 5.2l6 3 6-3M8 8.2v5.6',
  activity:'M1.8 8h2.8l1.8-4.6 2.6 9.2L11 8h3.2',
  eye:'M1.6 8S4 3.8 8 3.8 14.4 8 14.4 8 12 12.2 8 12.2 1.6 8 1.6 8Zm8 0a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z',
  archive:'M2.2 3.4h11.6v2.8H2.2V3.4ZM3.4 6.2v6.4h9.2V6.2M6.4 8.8h3.2',
  clock:'M8 14.4A6.4 6.4 0 1 0 8 1.6a6.4 6.4 0 0 0 0 12.8ZM8 4.6V8l2.4 1.6',
  target:'M8 14.4A6.4 6.4 0 1 0 8 1.6a6.4 6.4 0 0 0 0 12.8ZM8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8 9.4a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8Z',
  layers:'M8 2.2 14.4 5.6 8 9 1.6 5.6 8 2.2ZM1.6 9.2 8 12.6l6.4-3.4',
  grid:'M2.6 2.6h4.2v4.2H2.6V2.6ZM9.2 2.6h4.2v4.2H9.2V2.6ZM2.6 9.2h4.2v4.2H2.6V9.2ZM9.2 9.2h4.2v4.2H9.2V9.2Z',
  shield:'M8 2 13.2 4v4.4c0 3-2.2 5-5.2 5.8C5 13.4 2.8 11.4 2.8 8.4V4L8 2Z',
  link:'M6.6 9.4a2.6 2.6 0 0 0 3.7 0l2-2a2.6 2.6 0 1 0-3.7-3.7l-.9.9M9.4 6.6a2.6 2.6 0 0 0-3.7 0l-2 2a2.6 2.6 0 1 0 3.7 3.7l.9-.9',
  chevron:'M6 3.6 10.4 8 6 12.4',plus:'M8 3.4v9.2M3.4 8h9.2',
  more:'M3.4 8h.01M8 8h.01M12.6 8h.01',
  refresh:'M13.4 8a5.4 5.4 0 1 1-1.6-3.8M13.4 2.6v3.2h-3.2',
  filter:'M2.4 3.6h11.2L9.2 8.4v4.2L6.8 13.6V8.4L2.4 3.6Z',
  download:'M8 2.8v7M5 7l3 3 3-3M3 13h10',search:'M7.2 12.4a5.2 5.2 0 1 0 0-10.4 5.2 5.2 0 0 0 0 10.4ZM11 11l3 3'
};
export const icon=(name,size=13)=>{
  const d=P[name]||P.info;
  return `<span class="runs-ico" aria-hidden="true" style="width:${size}px;height:${size}px"><svg viewBox="0 0 16 16" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg></span>`;
};
/** Wrap a technical value so it stays readable in both directions. */
export const code=value=>`<code class="runs-mono">${esc(value)}</code>`;
export const fact=(label,value,emphasis=false)=>`<div class="runs-fact"${emphasis?' data-emphasis="on"':''}><dt>${esc(label)}</dt><dd title="${esc(String(value??''))}">${typeof value==='string'&&/^[A-Za-z0-9_\-.:/# ]+$/.test(value)?ltr(value):esc(value)}</dd></div>`;
