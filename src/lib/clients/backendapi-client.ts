import { post, get, RequestResponse, CoreOptions } from "request";

export class BackendApiClient {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.API_BACKEND;
  }

  async post(path: string, data: any) {
    const uri = `${this.apiUrl}/${path}`;

        let options: CoreOptions = {
            json: data,
            headers: {
                'Content-Type': 'application/json'
            }
        };

    return await new Promise<any>((resolve, reject) => {
      post(uri, options, (error: any, response: RequestResponse, body: string) => {
        if (error) return reject(error);
        if (response.statusCode != 200) return reject(response);

        if (!body)
          return resolve();

        if (typeof (body) == 'string')
          return resolve(JSON.parse(body.replace(/^\uFEFF/, '')));

        return resolve(body);
      });
    });
  }
}