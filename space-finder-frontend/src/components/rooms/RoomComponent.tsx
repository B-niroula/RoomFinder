import { getPlaceholderImageByIndex } from "../../utils/placeholderImages";
import { RoomEntry } from "../model/model";
import './RoomComponent.css';

interface RoomComponentProps extends RoomEntry {
  reserveRoom: (roomId: string, roomTitle: string) => void;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onSubscribe?: (roomId: string) => void;
  onContact?: (roomId: string, roomTitle: string) => void;
}

export default function RoomComponent(props: RoomComponentProps) {
  function renderImage() {
    if (props.photoUrl) {
      return <img src={props.photoUrl} alt={props.title}/>;
    } else {
      // Use placeholder image based on room ID for consistency
      const placeholderImage = getPlaceholderImageByIndex(props.id ? parseInt(props.id.slice(-1)) || 0 : 0);
      return <img src={placeholderImage} alt={props.title}/>;
    }
  }

  return (
    <div className="roomComponent">
      <div style={{ position: 'relative' }}>
        {renderImage()}
        <div className={`availability-badge ${props.isAvailable ? '' : 'unavailable'}`}>
          {props.isAvailable ? 'Available' : 'Unavailable'}
        </div>
      </div>
      <div className="room-content">
        <h3 className="room-title">{props.title}</h3>
        <div className="room-address">{props.address}</div>
        <div className="room-rent">${props.rent}/month</div>
        <div className="room-details">
          <span className="room-detail-item">🛏️ {props.bedrooms} bed</span>
          <span className="room-detail-item">🚿 {props.bathrooms} bath</span>
          {props.squareFeet && <span className="room-detail-item">📐 {props.squareFeet} sq ft</span>}
        </div>
        {props.amenities && props.amenities.length > 0 && (
          <div className="room-amenities">
            {props.amenities.slice(0, 3).map((amenity, index) => (
              <span key={index} className="amenity-tag">{amenity}</span>
            ))}
            {props.amenities.length > 3 && <span className="amenity-tag">+{props.amenities.length - 3} more</span>}
          </div>
        )}
        <div className="room-actions">
          <button className="contact-btn" onClick={() => props.onContact ? props.onContact(props.id, props.title) : props.reserveRoom(props.id, props.title)}>
            Contact Owner
          </button>
          <button className="btn-ghost small" type="button" onClick={() => props.onSubscribe && props.onSubscribe(props.id)}>Subscribe</button>
          {props.isOwner && (
            <div className="owner-actions">
              <button className="btn-ghost small" type="button" onClick={props.onEdit}>Edit</button>
              <button className="btn-ghost small danger" type="button" onClick={props.onDelete}>Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
