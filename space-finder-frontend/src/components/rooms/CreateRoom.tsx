import { SyntheticEvent, useState } from "react";
import { NavLink } from "react-router-dom";
import { DataService } from "../../services/DataService";

type CreateRoomProps = {
  dataService: DataService;
};

type CustomEvent = {
    target: HTMLInputElement
}

export default function CreateRoom({ dataService }: CreateRoomProps) {
  const [title, setTitle] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [rent, setRent] = useState<number>(0);
  const [bedrooms, setBedrooms] = useState<number>(1);
  const [bathrooms, setBathrooms] = useState<number>(1);
  const [squareFeet, setSquareFeet] = useState<number>(0);
  const [amenities, setAmenities] = useState<string>("");
  const [availableDate, setAvailableDate] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [photo, setPhoto] = useState<File | undefined>();
  const [actionResult, setActionResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+[1-9]\d{7,14}$/;

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    if (title && address && rent && contactEmail) {
      if (!emailRegex.test(contactEmail)) {
        setActionResult({ type: 'error', message: 'Provide a valid email address.' });
        return;
      }
      if (contactPhone && !phoneRegex.test(contactPhone)) {
        setActionResult({ type: 'error', message: 'Provide phone in E.164 format (e.g., +15551234567).' });
        return;
      }
      setIsSubmitting(true);
      setActionResult(null);
      try {
        const roomData = {
          title,
          address,
          description,
          rent,
          bedrooms,
          bathrooms,
          squareFeet: squareFeet || undefined,
          amenities: amenities.split(',').map(a => a.trim()).filter(a => a),
          availableDate,
          contactEmail,
          contactPhone: contactPhone || undefined,
          isAvailable: true
        };
        const id = await dataService.createRoom(roomData, photo);
        setActionResult({ type: 'success', message: `Room listed successfully! ID: ${id}` });
        // Reset form
        setTitle(''); setAddress(''); setDescription(''); setRent(0);
        setBedrooms(1); setBathrooms(1); setSquareFeet(0);
        setAmenities(''); setAvailableDate(''); setContactEmail(''); setContactPhone('');
        setPhoto(undefined);
      } catch (error) {
        setActionResult({ type: 'error', message: 'Failed to create listing. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setActionResult({ type: 'error', message: 'Please provide title, address, rent, and contact email!' });
    }
  };

  function setPhotoUrl(event: CustomEvent){
    if (event.target.files && event.target.files[0]) {
        setPhoto(event.target.files[0]);
    }
  }

  function renderPhoto() {
    if (photo) {
        const localPhotoURL = URL.createObjectURL(photo)
        return <div className="upload-preview">
          <img alt='' src={localPhotoURL} />
          <span>Preview</span>
        </div>
    }
  }

  function renderForm(){
    if (!dataService.isAuthorized()) {
      return (
        <div className="card notice-card">
          <p className="muted">Sign in to create a listing and upload photos.</p>
          <NavLink to={"/login"} className="btn-primary">Go to sign in</NavLink>
        </div>
      );
    }
    return (
      <form onSubmit={(e) => handleSubmit(e)} className="card form-card">
        <div className="form-grid two-col">
          <label className="input-control">
            <span>Room title</span>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Cozy bedroom in downtown" />
          </label>
          <label className="input-control">
            <span>Address</span>
            <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, City, State" />
          </label>
        </div>
        
        <label className="input-control">
          <span>Description</span>
          <textarea className="input text-area" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your room..." rows={4} />
        </label>
        
        <div className="form-grid three-col">
          <label className="input-control">
            <span>Monthly rent ($)</span>
            <input className="input" type="number" value={rent} onChange={(e) => setRent(Number(e.target.value))} placeholder="800" />
          </label>
          <label className="input-control">
            <span>Bedrooms</span>
            <input className="input" type="number" value={bedrooms} onChange={(e) => setBedrooms(Number(e.target.value))} min="1" />
          </label>
          <label className="input-control">
            <span>Bathrooms</span>
            <input className="input" type="number" value={bathrooms} onChange={(e) => setBathrooms(Number(e.target.value))} min="1" step="0.5" />
          </label>
        </div>
        
        <div className="form-grid two-col">
          <label className="input-control">
            <span>Square feet (optional)</span>
            <input className="input" type="number" value={squareFeet} onChange={(e) => setSquareFeet(Number(e.target.value))} placeholder="500" />
          </label>
          <label className="input-control">
            <span>Available date</span>
            <input className="input" type="date" value={availableDate} onChange={(e) => setAvailableDate(e.target.value)} />
          </label>
        </div>
        
        <label className="input-control">
          <span>Amenities (comma-separated)</span>
          <input className="input" value={amenities} onChange={(e) => setAmenities(e.target.value)} placeholder="WiFi, Parking, Laundry, AC" />
        </label>
        
        <div className="form-grid two-col">
          <label className="input-control">
            <span>Contact email</span>
            <input className="input" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="your@email.com" />
          </label>
          <label className="input-control">
            <span>Contact phone (optional)</span>
            <input className="input" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="(555) 123-4567" />
          </label>
        </div>
        
        <label className="input-control upload-control">
          <span>Room photo</span>
          <div className="upload-row">
            <input className="input file-input" type="file" onChange={(e) => setPhotoUrl(e)} accept="image/*" />
            {renderPhoto()}
          </div>
        </label>
        
        <button 
          type="submit" 
          className="btn-primary full-width" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating listing…' : 'Create room listing'}
        </button>
      </form>
    );
  }

  return (
    <div className="page-container narrow">
      <div className="page-hero">
        <p className="eyebrow">List your room</p>
        <h1>Showcase your space with photos and details.</h1>
        <p className="muted">Create a listing to reach the right tenant faster.</p>
      </div>
      
      {renderForm()}
      
      {actionResult && (
        <div 
          className={`status-banner ${actionResult.type}`}
        >
          <span>{actionResult.type === 'success' ? '✓' : '⚠️'}</span>
          <p>{actionResult.message}</p>
        </div>
      )}
    </div>
  )


}
