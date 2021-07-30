const db = require("@database/models")

class UserService {
  constructor(model) {
    this.model = model
  }

  async findOrCreate(email, contactNumber) {
    const [user] = await this.model.findOrCreate({
      where: { email, contactNumber: contactNumber || null },
    })
    return user
  }
}

module.exports = new UserService(db.User)