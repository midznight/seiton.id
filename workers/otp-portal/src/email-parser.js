const HEADER_WORD_RE=/=\?([^?]+)\?([bq])\?([^?]*)\?=/gi;

function bytesFromBinaryString(value){
  const bytes=new Uint8Array(value.length);
  for(let i=0;i<value.length;i+=1)bytes[i]=value.charCodeAt(i)&255;
  return bytes;
}

function decodeBytes(bytes,charset="utf-8"){
  try{return new TextDecoder(charset,{fatal:false}).decode(bytes);}
  catch{return new TextDecoder("utf-8",{fatal:false}).decode(bytes);}
}

function decodeQuotedPrintable(value){
  const normalized=String(value).replace(/=\r?\n/g,"");
  const bytes=[];
  for(let i=0;i<normalized.length;i+=1){
    if(normalized[i]==="="&&/^[0-9a-f]{2}$/i.test(normalized.slice(i+1,i+3))){
      bytes.push(parseInt(normalized.slice(i+1,i+3),16));i+=2;
    }else{
      bytes.push(normalized.charCodeAt(i)&255);
    }
  }
  return new Uint8Array(bytes);
}

function decodeHeaderWord(value){
  return String(value||"").replace(HEADER_WORD_RE,(_,charset,encoding,payload)=>{
    try{
      if(encoding.toLowerCase()==="b"){
        const binary=atob(payload.replace(/\s/g,""));
        return decodeBytes(bytesFromBinaryString(binary),charset);
      }
      const bytes=decodeQuotedPrintable(payload.replace(/_/g," "));
      return decodeBytes(bytes,charset);
    }catch{return payload;}
  }).replace(/\?=\s+=\?/g,"?==?").trim();
}

function parseHeaders(raw){
  const lines=String(raw||"").replace(/\r\n/g,"\n").split("\n");
  const headers={};
  let current="";
  for(const line of lines){
    if(/^[ \t]/.test(line)&&current){
      headers[current]+=" "+line.trim();
      continue;
    }
    const colon=line.indexOf(":");
    if(colon<=0)continue;
    current=line.slice(0,colon).trim().toLowerCase();
    const value=line.slice(colon+1).trim();
    headers[current]=headers[current]?headers[current]+", "+value:value;
  }
  return headers;
}

function splitEntity(raw){
  let index=raw.indexOf("\r\n\r\n"),width=4;
  if(index<0){index=raw.indexOf("\n\n");width=2;}
  if(index<0)return {headerBlock:raw,body:""};
  return {headerBlock:raw.slice(0,index),body:raw.slice(index+width)};
}

function parameter(value,name){
  const re=new RegExp("(?:^|;)\\s*"+name+"\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^;\\s]*))","i");
  const match=String(value||"").match(re);
  return match?(match[1]??match[2]??match[3]??"").trim():"";
}

function decodeBody(body,transferEncoding,charset){
  const encoding=String(transferEncoding||"").trim().toLowerCase();
  if(encoding==="base64"){
    const compact=String(body).replace(/[^a-z0-9+/=]/gi,"");
    try{return decodeBytes(bytesFromBinaryString(atob(compact)),charset||"utf-8");}
    catch{return "";}
  }
  if(encoding==="quoted-printable")return decodeBytes(decodeQuotedPrintable(body),charset||"utf-8");
  return decodeBytes(bytesFromBinaryString(body),charset||"utf-8");
}

function stripHtml(value){
  return String(value||"")
    .replace(/<\s*(script|style)[^>]*>[\s\S]*?<\/\s*\1\s*>/gi," ")
    .replace(/<\s*br\s*\/?>/gi,"\n")
    .replace(/<\s*\/\s*(p|div|li|tr|h[1-6])\s*>/gi,"\n")
    .replace(/<[^>]*>/g," ")
    .replace(/&nbsp;/gi," ")
    .replace(/&amp;/gi,"&")
    .replace(/&lt;/gi,"<")
    .replace(/&gt;/gi,">")
    .replace(/&quot;/gi,'"')
    .replace(/&#39;|&apos;/gi,"'")
    .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)||0))
    .replace(/[ \t]+/g," ")
    .replace(/\n[ \t]+/g,"\n")
    .trim();
}

function multipartParts(body,boundary){
  if(!boundary||boundary.length>200)return [];
  const marker="--"+boundary,parts=[];
  let cursor=0,start=-1;
  while(cursor<body.length){
    const index=body.indexOf(marker,cursor);
    if(index<0)break;
    if(index>0&&body[index-1]!=="\n"){cursor=index+marker.length;continue;}
    const lineEnd=body.indexOf("\n",index);
    const line=(lineEnd<0?body.slice(index):body.slice(index,lineEnd)).replace(/\r$/,"").trim();
    if(line===marker+"--"){
      if(start>=0)parts.push(body.slice(start,index).replace(/\r?\n$/,""));
      break;
    }
    if(line!==marker){cursor=index+marker.length;continue;}
    if(start>=0)parts.push(body.slice(start,index).replace(/\r?\n$/,""));
    start=lineEnd<0?body.length:lineEnd+1;
    cursor=start;
    if(lineEnd<0)break;
  }
  return parts.filter(part=>part.trim());
}

function collectText(raw,depth=0,budget={count:0}){
  if(depth>12||budget.count>=80)return [];
  budget.count+=1;
  const {headerBlock,body}=splitEntity(raw);
  const headers=parseHeaders(headerBlock);
  const contentType=headers["content-type"]||"text/plain";
  const disposition=headers["content-disposition"]||"";
  if(/(?:^|;)\s*attachment\b/i.test(disposition)||parameter(disposition,"filename")||parameter(contentType,"name"))return [];
  const type=contentType.split(";")[0].trim().toLowerCase();
  if(type.startsWith("multipart/")){
    const boundary=parameter(contentType,"boundary");
    return multipartParts(body,boundary).flatMap(part=>collectText(part,depth+1,budget));
  }
  if(type==="message/rfc822")return collectText(body,depth+1,budget);
  if(type!=="text/plain"&&type!=="text/html")return [];
  const charset=parameter(contentType,"charset")||"utf-8";
  const text=decodeBody(body,headers["content-transfer-encoding"],charset);
  return [{type,text}];
}

export function parseEmail(raw){
  const source=String(raw||"");
  const {headerBlock}=splitEntity(source);
  const headers=parseHeaders(headerBlock);
  const parts=collectText(source);
  const plain=parts.find(part=>part.type==="text/plain"&&part.text.trim());
  const html=parts.find(part=>part.type==="text/html"&&part.text.trim());
  const text=plain?plain.text:html?stripHtml(html.text):"";
  return {
    from:decodeHeaderWord(headers.from||""),
    subject:decodeHeaderWord(headers.subject||"(Tanpa subjek)"),
    messageId:String(headers["message-id"]||"").trim(),
    text
  };
}
