const axios = require('axios');
const _ = require('lodash')
const validateStatus = require('../utils/axios-utils')

const GITHUB_ORG_NAME = process.env.GITHUB_ORG_NAME
const BRANCH_REF = process.env.BRANCH_REF

class Directory {
  constructor(accessToken, siteName) {
    this.accessToken = accessToken
    this.siteName = siteName
    this.baseEndpoint = null
    this.dirType = null
  }

  setDirType(dirType) {
    this.dirType = dirType
    const folderPath = dirType.getFolderName()
    this.baseEndpoint = `https://api.github.com/repos/${GITHUB_ORG_NAME}/${this.siteName}/contents/${folderPath}`
  }

  async list() {
    try {
      const endpoint = `${this.baseEndpoint}`

      const params = {
        "ref": BRANCH_REF,
      }

      const resp = await axios.get(endpoint, {
        validateStatus,
        params,
        headers: {
          Authorization: `token ${this.accessToken}`,
          "Content-Type": "application/json"
        }
      })
  
      if (resp.status !== 200) return {}
  
      const directories = resp.data.map(object => {
        const pathNameSplit = object.path.split("/")
        const dirName = pathNameSplit[pathNameSplit.length - 1]
        if (object.type === 'dir') {
          return {
            path: encodeURIComponent(object.path),
            dirName
          }
        }
      })
  
      if (this.dirType instanceof ResourceRoomType) {
        return _.compact(directories)
      }

      return resp.data
    } catch (err) {
      throw err
    }
  }
}

class ResourceRoomType {
  constructor(resourceRoomName) {
    this.folderName = `${resourceRoomName}`
  }
  getFolderName() {
    return this.folderName
  }
}

module.exports = { Directory, ResourceRoomType }
