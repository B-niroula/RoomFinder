import { RoomEntry } from "../model/Model";


export class MissingFieldError extends Error {
  constructor(missingField: string) {
    super(`Value for ${missingField} expected!`);
  }
}

export class JsonError extends Error {};
export class ValidationError extends Error {};

function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string) {
  const phoneRegex = /^\+[1-9]\d{7,14}$/;
  return phoneRegex.test(phone);
}

export function validateAsRoomEntry(arg: any) {
  if ((arg as RoomEntry).id == undefined) {
    throw new MissingFieldError("id");
  }
  if ((arg as RoomEntry).address == undefined) {
    throw new MissingFieldError("address");
  }
  if ((arg as RoomEntry).title == undefined) {
    throw new MissingFieldError("title");
  }
  if ((arg as RoomEntry).contactEmail == undefined) {
    throw new MissingFieldError("contactEmail");
  }
  if (!isValidEmail((arg as RoomEntry).contactEmail)) {
    throw new ValidationError("Invalid email format");
  }
  if ((arg as RoomEntry).contactPhone && !isValidPhone((arg as RoomEntry).contactPhone)) {
    throw new ValidationError("Invalid phone format, use E.164 like +15551234567");
  }
}
