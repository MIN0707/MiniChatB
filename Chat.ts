import {Model, model,Schema} from "mongoose";

export interface Imessage {
    text: string;
    sender: string;
    timestamp: string;
}

const chatSchema = new Schema<Imessage>({
    text: {type: String, required: true},
    sender: {type: String, required: true},
    timestamp: {type: String, required: true}
});

const Chat:Model<Imessage> = model('a', chatSchema);

export default Chat;