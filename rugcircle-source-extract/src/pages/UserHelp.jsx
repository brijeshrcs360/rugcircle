import { useState } from 'react'
import { api } from '../services/api'

export default function UserHelp() { const [message, setMessage] = useState(''); const [wa, setWa] = useState(''); const submit = async (e) => { e.preventDefault(); const r = await api.raiseCase(message); setWa(r.whatsapp || '') }
return <section className="admin-card"><h2>Help</h2><form onSubmit={submit}><div className="form-group"><label>Case Raise</label><textarea value={message} onChange={(e)=>setMessage(e.target.value)} /></div><button className="btn-primary" type="submit">Raise Case</button></form>{wa && <p style={{marginTop:12}}><a href={wa} target="_blank" rel="noreferrer">WhatsApp Help</a></p>}</section> }
