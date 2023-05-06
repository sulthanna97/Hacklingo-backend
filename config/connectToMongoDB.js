import mongoose from "mongoose";

main().catch(err => console.log(err));


// Change url to mongodb://127.0.0.1:27017/HacklingoDBTest for testing, and mongodb://127.0.0.1:27017/HacklingoDB for development
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/HacklingoDBTest');
}

export default mongoose;