import { Amplify } from 'aws-amplify';
import { SignInOutput, fetchAuthSession, signIn, signOut, signUp, confirmSignUp } from '@aws-amplify/auth';
import { AuthStack } from '../../../space-finder/outputs.json'
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';

const awsRegion = 'us-east-1';

Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: AuthStack.SpaceUserPoolId,
        userPoolClientId: AuthStack.SpaceUserPoolClientId,
        identityPoolId: AuthStack.SpaceIdentityPoolId
      },
    },
  });

export class AuthService {

    private user: SignInOutput | undefined;
    private userName: string = '';
    private userId: string | undefined;
    public jwtToken: string | undefined;
    private temporaryCredentials: object | undefined;

    public isAuthorized(){
        return !!this.jwtToken;
    }

    public async signUp(userName: string, password: string, email?: string, phone?: string) {
        try {
            const signUpOptions: any = {
                username: userName,
                password,
                options: {}
            };
            const attrs: Record<string, string> = {};
            if (email) attrs.email = email;
            if (phone) attrs.phone_number = phone;
            if (Object.keys(attrs).length) {
                signUpOptions.options.userAttributes = attrs;
            }
            await signUp(signUpOptions);
            this.userName = userName;
            return true;
        } catch (error) {
            console.error('Sign up error:', error);
            return false;
        }
    }

    public async confirmSignUp(userName: string, code: string) {
        try {
            await confirmSignUp({ username: userName, confirmationCode: code });
            return true;
        } catch (error) {
            console.error('Confirm sign up error:', error);
            return false;
        }
    }


    public async login(userName: string, password: string):Promise<Object | undefined> {
        try {
            // Sign out any existing user first
            try {
                await signOut();
            } catch (e) {
                // Ignore if no user is signed in
            }
            
            const signInOutput: SignInOutput = await signIn({
                username: userName,
                password: password,
                options: {
                    authFlowType: 'USER_PASSWORD_AUTH'
                }
            });
            this.user = signInOutput;
            this.userName = userName;
            await this.generateIdToken();
            return this.user;
        } catch (error) {
            console.error('Login error:', error);
            return undefined
        }
    }

    public async getTemporaryCredentials(){
        if (this.temporaryCredentials) {
            return this.temporaryCredentials
        }
        this.temporaryCredentials = await this.generateTempCredentials()
        return this.temporaryCredentials;
    }

    private async generateTempCredentials(){
        const cognitoIdentityPool = `cognito-idp.${awsRegion}.amazonaws.com/${AuthStack.SpaceUserPoolId}`;
        const cognitoIdentity = new CognitoIdentityClient({
            credentials: fromCognitoIdentityPool({
                clientConfig: {
                    region: awsRegion
                },
                identityPoolId: AuthStack.SpaceIdentityPoolId,
                logins: {
                    [cognitoIdentityPool]: this.jwtToken!
                }
            })
        });
        const credentials = await cognitoIdentity.config.credentials();
        return credentials
    }

    private async generateIdToken(){
        const session = await fetchAuthSession();
        this.jwtToken = session.tokens?.idToken?.toString();
        this.userId = session.tokens?.idToken?.payload?.sub;
    }

    public getIdToken(){
        return this.jwtToken;
    } 

    public getUserName(){
        return this.userName
    }

    public getUserId(){
        return this.userId;
    }

    public async logout(){
        try {
            await signOut();
            this.user = undefined;
            this.userName = '';
            this.userId = undefined;
            this.jwtToken = undefined;
            this.temporaryCredentials = undefined;
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }
}
