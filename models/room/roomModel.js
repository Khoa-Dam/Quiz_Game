import mongoose from 'mongoose';


const roomModel = new mongoose.Schema({
    roomCode: {type: String, required: true, unique: true, uppercase: true, length: 6},
    quiz: {type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true},
    host: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    players: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    status: {type: String, enum: ["waiting", "playing", "paused", "finished"], default: "waiting"},
    currentQuestion: {type: Number, default: -1},
    questionStartTime: {type: Date},
    settings: {
        maxPlayers: {type: Number, default: 8, min: 2, max: 20},
        autoStart: {type: Boolean, default: false},
        showLeaderboard: {type: Boolean, default: true}
    }
}, {
    timestamps: true,
    expires: "24h"  
})

export default mongoose.model("Room", roomModel);