#!/usr/bin/env python3
"""Arma informe.html desde parts/*.html + models.json, imprime a PDF con Chromium y genera previews."""
import json, os, glob, subprocess, sys, html, re
HERE=os.path.dirname(os.path.abspath(__file__))
CHROME="/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
def esc(s): return html.escape(str(s)) if s is not None else ""
def md(s):
    """mini-markdown: **b**, *i*, [txt](url), saltos de línea -> <br>"""
    if s is None: return ""
    s=esc(s)
    s=re.sub(r"\*\*(.+?)\*\*",r"<b>\1</b>",s)
    s=re.sub(r"\*(.+?)\*",r"<i>\1</i>",s)
    s=re.sub(r"\[(.+?)\]\((https?://[^\s)]+)\)",r'<a href="\2">\1</a>',s)
    return s.replace("\n","<br>")
ORIG={"eu":"Europa","cn":"China","us":"USA / Canadá","la":"Latinoamérica"}
def score_row(lab,v):
    return f'<div class="score"><span class="lab">{esc(lab)}</span><span class="bar"><i style="width:{int(v*10)}%"></i></span><span class="v">{v:g}/10</span></div>'
def ficha(m,idx):
    img=m.get("img")
    if img and os.path.exists(os.path.join(HERE,img)):
        photo=f'<div class="photo"><img src="{esc(img)}"></div><div class="cap">{md(m.get("img_cap",""))}</div>'
    else:
        photo=f'<div class="photo"><div class="nf">Foto no disponible offline — ver web del fabricante:<br>{esc(m.get("web",""))}</div></div>'
    specs="".join(f"<tr><td>{esc(k)}</td><td>{md(v)}</td></tr>" for k,v in m.get("specs",[]))
    quotes="".join(f'<div class="quote">“{md(q["t"])}”<span class="src">— {md(q["s"])}</span></div>' for q in m.get("quotes",[]))
    sc=m.get("scores",{})
    scores="".join(score_row(k,v) for k,v in sc.items())
    avg=round(sum(sc.values())/len(sc),1) if sc else ""
    pros="".join(f"<li>{md(p)}</li>" for p in m.get("pros",[]))
    cons="".join(f"<li>{md(p)}</li>" for p in m.get("cons",[]))
    tags="".join(f'<span class="pill">{esc(t)}</span>' for t in m.get("tags",[]))
    return f'''
<section class="ficha" id="m{idx}">
 <div class="head">
  <div><div class="brand">{esc(m["brand"])} <span class="tag {m['region']}">{ORIG.get(m['region'],'')}</span></div>
   <div class="model">Ficha {idx}: {esc(m["model"])}</div>
   <div class="origin">{esc(m.get("origin",""))} · {esc(m.get("type",""))}</div></div>
  <div class="price"><div class="n">{esc(m.get("price_headline",""))}</div><div class="l">{esc(m.get("price_sub",""))}</div></div>
 </div>
 <div class="cols">
  <div class="c55">
   {photo}
   <h4>Ficha técnica</h4>
   <table class="spec tight">{specs}</table>
   <div style="margin-top:1mm">{tags}</div>
  </div>
  <div>
   <div class="box blue"><h4>Precio y disponibilidad</h4>{md(m.get("price_text",""))}</div>
   <div class="box grey"><h4>Contacto</h4>{md(m.get("contact",""))}</div>
   <div class="box grey"><h4>Sistema propio / IoT</h4>{md(m.get("iot",""))}</div>
   <div class="box"><h4>Puntaje CARBOYS <span class="mut" style="font-weight:400;text-transform:none;letter-spacing:0">(promedio {avg})</span></h4>{scores}</div>
  </div>
 </div>
 <div class="cols" style="margin-top:2mm">
  <div class="c55"><h4>Lo que dice la gente</h4>{quotes}</div>
  <div><h4>A favor</h4><ul style="margin-bottom:1.5mm">{pros}</ul><h4>En contra</h4><ul>{cons}</ul></div>
 </div>
 <div class="verd avoid"><b>Veredicto CARBOYS:</b> {md(m.get("verdict",""))}</div>
</section>'''
def tabla_resumen(models):
    rows=""
    for i,m in enumerate(models,1):
        sc=m.get("scores",{}); avg=round(sum(sc.values())/len(sc),1) if sc else ""
        rows+=f'<tr><td><b>{i}</b></td><td><b>{esc(m["brand"])}</b><br><span class="small">{esc(m.get("origin",""))}</span></td><td>{esc(m["model"])}<br><span class="small">{esc(m.get("type",""))}</span></td><td>{esc(m.get("t_precio",""))}</td><td>{esc(m.get("t_instalado",""))}</td><td>{esc(m.get("t_soporte",""))}</td><td>{esc(m.get("t_iot",""))}</td><td style="text-align:center"><b>{avg}</b></td></tr>'
    return f'''<table class="tight"><thead><tr><th>#</th><th>Fabricante</th><th>Modelo</th><th>Precio máquina (ref.)</th><th>Instalado en Córdoba (est.)</th><th>Soporte / repuestos AR</th><th>IoT propio</th><th>Puntaje</th></tr></thead><tbody>{rows}</tbody></table>'''
def load_models(models_file):
    if models_file.endswith(".py"):
        import importlib.util
        spec=importlib.util.spec_from_file_location("md",os.path.join(HERE,models_file)); mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod); return mod.MODELS
    return json.load(open(os.path.join(HERE,models_file),encoding="utf-8")) if os.path.exists(os.path.join(HERE,models_file)) else []
def build(out="informe.html", models_file="models_data.py", toc_pages=None):
    models=load_models(models_file)
    parts=sorted(glob.glob(os.path.join(HERE,"parts","*.html")))
    body=""
    for p in parts:
        t=open(p,encoding="utf-8").read()
        if "<!--FICHAS-->" in t:
            t=t.replace("<!--FICHAS-->","".join(ficha(m,i) for i,m in enumerate(models,1)))
        if "<!--TABLA_RESUMEN-->" in t:
            t=t.replace("<!--TABLA_RESUMEN-->",tabla_resumen(models))
        if toc_pages:
            for key,pg in toc_pages.items():
                t=t.replace(f'data-toc="{key}"></span>',f'data-toc="{key}">{pg}</span>')
        body+=t+"\n"
    doc=f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><title>CARWASH by CARBOYS — Proyecto Lavaautos Automáticos</title>
<link rel="stylesheet" href="fonts.css"><link rel="stylesheet" href="style.css"></head><body>{body}</body></html>'''
    open(os.path.join(HERE,out),"w",encoding="utf-8").write(doc)
    return os.path.join(HERE,out)
def pdf(html_path, pdf_path):
    r=subprocess.run([CHROME,"--headless=new","--no-sandbox","--disable-gpu","--no-pdf-header-footer","--run-all-compositor-stages-before-draw","--virtual-time-budget=20000",f"--print-to-pdf={pdf_path}","file://"+html_path],capture_output=True,text=True,timeout=300)
    import pymupdf
    d=pymupdf.open(pdf_path); n=len(d)
    return n,d
def previews(d, outdir, dpi=45, pages=None):
    os.makedirs(outdir,exist_ok=True)
    for f in glob.glob(os.path.join(outdir,"*.png")): os.remove(f)
    for i,p in enumerate(d):
        if pages and (i+1) not in pages: continue
        p.get_pixmap(dpi=dpi).save(os.path.join(outdir,f"p{i+1:03d}.png"))
def find_toc_pages(d, keys, skip=2):
    res={}
    for k in keys:
        for i,p in enumerate(d):
            if i<skip: continue
            if p.search_for(k):
                res[k]=i+1; break
    return res
if __name__=="__main__":
    out=sys.argv[1] if len(sys.argv)>1 else "informe"
    mf=sys.argv[2] if len(sys.argv)>2 else "models_data.py"
    h=build(out+".html", mf)
    n,d=pdf(h, os.path.join(HERE,out+".pdf"))
    keys=re.findall(r'data-toc="([^"]+)"', open(h,encoding="utf-8").read())
    pages=find_toc_pages(d, keys)
    print("TOC:",pages)
    h=build(out+".html", mf, toc_pages=pages)
    n,d=pdf(h, os.path.join(HERE,out+".pdf"))
    print("PDF pages:",n)
    previews(d, os.path.join(HERE,"preview"))
