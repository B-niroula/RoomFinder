import { useState, useEffect } from "react";
import RoomComponent from "./RoomComponent";
import { DataService } from "../../services/DataService";
import { NavLink } from "react-router-dom";
import { RoomEntry } from "../model/model";

interface RoomsProps {
    dataService: DataService;
    currentUserId?: string;
}

export default function Rooms(props: RoomsProps){

    const [rooms, setRooms] = useState<RoomEntry[]>();
    const [contactText, setContactText] = useState<string>();
    const [editingRoom, setEditingRoom] = useState<RoomEntry | null>(null);
    const [editDraft, setEditDraft] = useState<Partial<RoomEntry>>({});
    const [status, setStatus] = useState<string>();
    const [subscribeRoomId, setSubscribeRoomId] = useState<string | null>(null);
    const [subscribeEndpoint, setSubscribeEndpoint] = useState<string>('');
    const [subscribeProtocol, setSubscribeProtocol] = useState<'email' | 'sms'>('email');
    const [contactRoom, setContactRoom] = useState<RoomEntry | null>(null);
    const [contactMessage, setContactMessage] = useState<string>('');
    const [contactEmail, setContactEmail] = useState<string>('');

    useEffect(()=>{
        const getRooms = async ()=>{
            const rooms = await props.dataService.getRooms();
            setRooms(rooms);
        }
        getRooms();
    }, [])

    async function reserveRoom(roomId: string, roomTitle: string){
        const room = rooms?.find(r => r.id === roomId);
        if (room) {
            const contactInfo = [];
            if (room.contactEmail) contactInfo.push(`Email: ${room.contactEmail}`);
            if (room.contactPhone) contactInfo.push(`Phone: ${room.contactPhone}`);
            setContactText(`Contact info for ${roomTitle}: ${contactInfo.join(' | ')}`);
        }
    }

    function startEdit(room: RoomEntry) {
        setEditingRoom(room);
        setEditDraft({
            title: room.title,
            description: room.description,
            rent: room.rent,
            isAvailable: room.isAvailable
        });
        setStatus(undefined);
    }

    async function submitEdit() {
        if (!editingRoom) return;
        try {
            await props.dataService.updateRoom(editingRoom.id, editDraft);
            const updatedRooms = await props.dataService.getRooms();
            setRooms(updatedRooms);
            setStatus("Listing updated");
            setEditingRoom(null);
        } catch (error) {
            setStatus("Failed to update listing");
        }
    }

    async function handleDelete(roomId: string) {
        try {
            await props.dataService.deleteRoom(roomId);
            setRooms((prev) => prev?.filter(r => r.id !== roomId));
            setStatus("Listing deleted");
        } catch (error) {
            setStatus("Failed to delete listing");
        }
    }

    function openSubscribe(roomId: string) {
        setSubscribeRoomId(roomId);
        setSubscribeEndpoint('');
        setSubscribeProtocol('email');
        setStatus(undefined);
    }

    async function submitSubscribe() {
        if (!subscribeRoomId || !subscribeEndpoint) return;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+[1-9]\d{7,14}$/;
        if (subscribeProtocol === 'email' && !emailRegex.test(subscribeEndpoint)) {
            setStatus('Enter a valid email to subscribe.');
            return;
        }
        if (subscribeProtocol === 'sms' && !phoneRegex.test(subscribeEndpoint)) {
            setStatus('Enter a valid phone in E.164 format (e.g., +15551234567).');
            return;
        }
        try {
            await props.dataService.subscribeToRoom(subscribeRoomId, subscribeProtocol, subscribeEndpoint);
            setStatus('Subscription requested. Confirm if required.');
            setSubscribeRoomId(null);
        } catch (error) {
            setStatus('Failed to subscribe');
        }
    }

    function openContact(room: RoomEntry) {
        setContactRoom(room);
        setContactMessage('');
        setContactEmail('');
        setStatus(undefined);
    }

    async function submitContact() {
        if (!contactRoom || !contactMessage) return;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (contactEmail && !emailRegex.test(contactEmail)) {
            setStatus('Enter a valid email.');
            return;
        }
        try {
            await props.dataService.contactOwner(contactRoom.id, contactMessage, contactEmail || undefined);
            setStatus('Message sent to owner');
            setContactRoom(null);
        } catch (error) {
            setStatus('Failed to contact owner');
        }
    }

    function renderRooms(){
        if(!props.dataService.isAuthorized()) {
            return<NavLink to={"/login"}>Please login</NavLink>
        }
        const rows: any[] = [];
        if(rooms) {
            for(const roomEntry of rooms) {
                const isOwner = props.currentUserId && roomEntry.ownerId === props.currentUserId;
                rows.push(
                    <RoomComponent 
                        key={roomEntry.id}
                        {...roomEntry}
                        reserveRoom={reserveRoom}
                        isOwner={!!isOwner}
                        onEdit={() => startEdit(roomEntry)}
                        onDelete={() => handleDelete(roomEntry.id)}
                        onSubscribe={() => openSubscribe(roomEntry.id)}
                        onContact={() => openContact(roomEntry)}
                    />
                )
            }
        }
        return rows;
    }

    return (
        <div className="page-container">
            <div className="page-hero compact">
                <p className="eyebrow">Browse rooms</p>
                <h1>Find the right fit</h1>
                <p className="muted">Discover comfortable, well-detailed rooms in your area.</p>
            </div>
            {contactText && (
                <div className="status-banner info">
                    <span>ℹ️</span>
                    <p>{contactText}</p>
                </div>
            )}
            {status && (
                <div className="status-banner info">
                    <span>ℹ️</span>
                    <p>{status}</p>
                </div>
            )}
            {editingRoom && (
                <div className="card" style={{ marginBottom: '18px', display: 'grid', gap: '12px' }}>
                    <div className="eyebrow">Edit listing</div>
                    <strong>{editingRoom.title}</strong>
                    <label className="input-control">
                        <span>Title</span>
                        <input className="input" value={editDraft.title || ''} onChange={(e) => setEditDraft({...editDraft, title: e.target.value})}/>
                    </label>
                    <label className="input-control">
                        <span>Description</span>
                        <textarea className="input text-area" value={editDraft.description || ''} onChange={(e) => setEditDraft({...editDraft, description: e.target.value})}/>
                    </label>
                    <div className="form-grid two-col">
                        <label className="input-control">
                            <span>Rent ($)</span>
                            <input className="input" type="number" value={editDraft.rent ?? 0} onChange={(e) => setEditDraft({...editDraft, rent: Number(e.target.value)})}/>
                        </label>
                        <label className="input-control">
                            <span>Availability</span>
                            <select className="input" value={editDraft.isAvailable ? 'yes' : 'no'} onChange={(e) => setEditDraft({...editDraft, isAvailable: e.target.value === 'yes'})}>
                                <option value="yes">Available</option>
                                <option value="no">Unavailable</option>
                            </select>
                        </label>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button className="btn-ghost" type="button" onClick={() => setEditingRoom(null)}>Cancel</button>
                        <button className="btn-primary" type="button" onClick={submitEdit}>Save changes</button>
                    </div>
                </div>
            )}
            {subscribeRoomId && (
                <div className="card" style={{ marginBottom: '18px', display: 'grid', gap: '12px' }}>
                    <div className="eyebrow">Subscribe to listing</div>
                    <label className="input-control">
                        <span>Protocol</span>
                        <select className="input" value={subscribeProtocol} onChange={(e) => setSubscribeProtocol(e.target.value as 'email' | 'sms')}>
                            <option value="email">Email</option>
                            <option value="sms">SMS</option>
                        </select>
                    </label>
                    <label className="input-control">
                        <span>{subscribeProtocol === 'email' ? 'Email address' : 'Phone number (E.164)'}</span>
                        <input className="input" value={subscribeEndpoint} onChange={(e) => setSubscribeEndpoint(e.target.value)} />
                    </label>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button className="btn-ghost" type="button" onClick={() => setSubscribeRoomId(null)}>Cancel</button>
                        <button className="btn-primary" type="button" onClick={submitSubscribe}>Subscribe</button>
                    </div>
                </div>
            )}
            {contactRoom && (
                <div className="card" style={{ marginBottom: '18px', display: 'grid', gap: '12px' }}>
                    <div className="eyebrow">Contact owner</div>
                    <strong>{contactRoom.title}</strong>
                    <label className="input-control">
                        <span>Your message</span>
                        <textarea className="input text-area" value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} />
                    </label>
                    <label className="input-control">
                        <span>Your email (optional)</span>
                        <input className="input" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                    </label>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button className="btn-ghost" type="button" onClick={() => setContactRoom(null)}>Cancel</button>
                        <button className="btn-primary" type="button" onClick={submitContact}>Send</button>
                    </div>
                </div>
            )}
            <div className="rooms-grid">
                {renderRooms()}
            </div>
        </div>
    )

}
