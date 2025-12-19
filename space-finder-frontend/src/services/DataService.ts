import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AuthService } from "./AuthService";
import { DataStack, ApiStack } from '../../../space-finder/outputs.json';
import { RoomEntry } from "../components/model/model";

const roomsUrl = ApiStack.SpacesApiEndpoint36C4F3B6 + 'spaces';


export class DataService {

    private authService: AuthService;
    private s3Client: S3Client | undefined;
    private awsRegion = 'us-east-1';

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    public reserveRoom(roomId: string) {
        return roomId;
    }

    public async getRooms():Promise<RoomEntry[]>{
        const getRoomsResult = await fetch(roomsUrl, {
            method: 'GET',
            headers: {
                'Authorization': this.authService.jwtToken!
            }
        });
        const getRoomsResultJson = await getRoomsResult.json();
        return getRoomsResultJson;
    }


    public async createRoom(roomData: Partial<RoomEntry>, photo?: File){
        const room = { ...roomData } as any;
        if (photo) {
            const uploadUrl = await this.uploadPublicFile(photo);
            room.photoUrl = uploadUrl;
        }
        const postResult = await fetch(roomsUrl, {
            method: 'POST',
            body: JSON.stringify(room),
            headers: {
                'Authorization':  this.authService.jwtToken!
            }
        });
        const postResultJson = await postResult.json();
        return postResultJson.id;
    }

    public async subscribeToRoom(roomId: string, protocol: 'email' | 'sms', endpoint: string){
        const result = await fetch(`${roomsUrl}/subscribe`, {
            method: 'POST',
            headers: {
                'Authorization': this.authService.jwtToken!,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ roomId, protocol, endpoint })
        });
        if (!result.ok) {
            throw new Error('Subscription failed');
        }
        return result.json();
    }

    public async contactOwner(roomId: string, message: string, fromEmail?: string){
        const result = await fetch(`${roomsUrl}/contact`, {
            method: 'POST',
            headers: {
                'Authorization': this.authService.jwtToken!,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ roomId, message, fromEmail })
        });
        if (!result.ok) {
            throw new Error('Contact failed');
        }
        return result.json();
    }

    public async updateRoom(roomId: string, updates: Partial<RoomEntry>) {
        const putResult = await fetch(`${roomsUrl}?id=${roomId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
            headers: {
                'Authorization': this.authService.jwtToken!
            }
        });
        if (!putResult.ok) {
            throw new Error('Failed to update room');
        }
        return putResult.json();
    }

    public async deleteRoom(roomId: string) {
        const deleteResult = await fetch(`${roomsUrl}?id=${roomId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': this.authService.jwtToken!
            }
        });
        if (!deleteResult.ok) {
            throw new Error('Failed to delete room');
        }
        return deleteResult.json();
    }

    private async uploadPublicFile(file: File){
        const credentials = await this.authService.getTemporaryCredentials();
        if (!this.s3Client) {
            this.s3Client = new S3Client({
                credentials: credentials as any,
                region: this.awsRegion
            });
        }
        const command = new PutObjectCommand({
            Bucket: DataStack.SpaceFinderPhotosBucketName,
            Key: file.name,
            ACL: 'public-read',
            Body: file
        });
        await this.s3Client.send(command);
        return `https://${command.input.Bucket}.s3.${this.awsRegion}.amazonaws.com/${command.input.Key}`
    }

    public isAuthorized(){
        return this.authService.isAuthorized();
    }
}
