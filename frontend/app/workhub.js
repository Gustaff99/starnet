/* Discovery stays with the Commander profile; prepared work opens in Recipes.
   Retain this module path and the saved discovery data when retiring the duplicate hub. */
'use strict';
(() => {
  const esc = StationUI.h.esc;
  async function post(path, body) {
    const r = await Harness.apiFetch(path, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const j = await r.json();
    if (!r.ok || j.ok === false) throw new Error(j.error || j.reason || 'Could not save the change.');
    return j;
  }
  function openDraft(options) {
    StationUI.closeTerm('commander');
    Marketplace.open({tab:'recipes',firstValue:options || {},onLaunch:App.launchRecipe});
    return true;
  }
  function mountSources(parent) {
    const detail = document.createElement('details');
    detail.className = 'wh-source-settings';
    detail.innerHTML = '<summary>Fuentes que StarNet puede estudiar para trabajo útil</summary><div class="wh"><p class="wh-message" role="status"></p><div class="wh-content"></div></div>';
    parent.appendChild(detail);
    const host=detail.querySelector('.wh-content'), message=detail.querySelector('.wh-message');
    let sources=null, findings=[], loading=false;
    const say = text => {if(message.isConnected)message.textContent=text;};
    async function refresh() {
      if(loading)return; loading=true; host.textContent='Leyendo tus fuentes…';
      try {
        const j=await Harness.api.get('/api/discovery/sources');
        if(!j || !j.ok || !Array.isArray(j.sources))throw Error('No se pudieron leer las fuentes. Vuelve a abrir esta sección para reintentar.');
        const d=await Harness.api.get('/api/discovery');
        if(!d || !Array.isArray(d.staged))throw Error('No se pudieron leer las sugerencias. Vuelve a abrir esta sección para reintentar.');
        if(!detail.isConnected)return;
        sources=j; findings=d && Array.isArray(d.staged)?d.staged:[];
        const roots=(j.approvedRoots || []).map(r=>typeof r==='string'?r:r.root || r.path).filter(Boolean);
        const source=j.sources.find(s=>s.kind==='client-update');
        host.innerHTML='<p>Elige una carpeta aprobada de notas. StarNet busca actualizaciones del cliente que valga la redactar y muestra la evidencia aquí. Escanear estos archivos de texto es local; iniciar un borrador envía su contexto de tarea a tu modelo configurado.</p>'
          +(roots.length?'<label class="wh-field">Carpeta<select class="key-input wh-root">'+roots.map(r=>'<option'+(source && source.root===r?' selected':'')+'>'+esc(r)+'</option>').join('')+'</select></label><button class="bb sm" data-save>USAR ESTA CARPETA</button>':'<p>Aún no hay carpetas aprobadas. Elige una carpeta de proyecto o usa una muestra pegada.</p>')
          +'<div class="wh-actions"><button class="bb sm" data-projects>CARPETAS DE PROYECTO</button><button class="bb sm" data-sample>USAR UNA MUESTRA</button></div>'
          +(source?'<p>'+esc(source.root)+' · '+(source.enabled?'descubrimiento activado':'descubrimiento en pausa')+(source.available===false?' · carpeta no disponible':'')+'</p><div class="wh-actions"><button class="bb sm" data-toggle>'+(source.enabled?'PAUSAR':'REANUDAR')+'</button><button class="bb sm" data-remove>QUITAR FUENTE</button><button class="bb sm" data-scan>ESCANEAR AHORA</button></div>':'')
          +'<h4>Sugerencias de estas notas</h4>'+(findings.length?findings.map((f,i)=>'<article class="wh-card"><b>'+esc(f.title)+'</b><p>'+esc(f.quote)+'</p><details><summary>Por qué se sugirió esto</summary>'+(f.evidence || []).map(e=>'<p>'+esc(e.path)+':'+esc(e.line)+' — '+esc(e.quote)+'</p>').join('')+'</details><div class="wh-actions"><button class="bb sm" data-finding="'+i+'">REVISAR BORRADOR</button><button class="bb sm" data-dismiss="'+i+'">NO ÚTIL</button></div></article>').join(''):'<p>No hay sugerencias actuales de esta fuente. Tu agente está disponible en COMMS para cualquier tarea.</p>');
      } catch(e) {if(detail.isConnected)host.textContent=e.message;} finally {loading=false;}
    }
    detail.addEventListener('toggle',ev=>{if(ev.target===detail && detail.open)refresh();});
    detail.addEventListener('click',async ev=>{
      const b=ev.target.closest('button'); if(!b || !detail.contains(b))return;
      if(b.hasAttribute('data-sample')){openDraft();return;}
      if(b.hasAttribute('data-projects')){StationUI.closeTerm('commander');document.getElementById('ws-tab-projects')?.click();return;}
      if(b.dataset.finding!==undefined){const f=findings[Number(b.dataset.finding)];if(f)openDraft({findingId:f.id,root:f.root,intent:'client-update',pain:f.title,reason:'Suggested from evidence in your selected folder'});return;}
      const source=sources && sources.sources.find(s=>s.kind==='client-update'); b.disabled=true;
      try {
        if(b.hasAttribute('data-save'))await post('/api/discovery/sources',{root:host.querySelector('.wh-root').value,enabled:true});
        else if(b.hasAttribute('data-toggle') && source)await post('/api/discovery/sources',{enabled:!source.enabled});
        else if(b.hasAttribute('data-remove'))await post('/api/discovery/sources',{remove:true});
        else if(b.hasAttribute('data-scan'))await post('/api/discovery/scan',{});
        else if(b.dataset.dismiss!==undefined){const f=findings[Number(b.dataset.dismiss)];if(f)await post('/api/discovery/decide',{id:f.id,decision:'dismiss'});}
        say('Updated. Review the source and suggestions below.');await refresh();
      }catch(e){say(e.message);}finally{if(b.isConnected)b.disabled=false;}
    });
  }
  window.WorkHub={mountSources,open:(pane,options)=>pane==='draft' || pane==='start'?openDraft(options):StationUI.openTerm(pane==='sources'?'commander':pane==='station'?'quests':'tasks')};
  FirstValue.configure({onOpen:openDraft});
})();
