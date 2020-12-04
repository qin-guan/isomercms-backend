const { Base64 } = require('js-base64')
const _ = require('lodash')
const yaml = require('js-yaml')
const Bluebird = require('bluebird')

// import classes
const { Config } = require('../classes/Config.js')
const { File, DataType, HomepageType } = require('../classes/File.js')

// Constants
const FOOTER_PATH = 'footer.yml'
const NAVIGATION_PATH = 'navigation.yml'
const HOMEPAGE_INDEX_PATH = 'index.md' // Empty string

const retrieveSettingsFiles = async (accessToken, siteName, shouldRetrieveHomepage) => {
  const configResp = new Config(accessToken, siteName)

  const FooterFile = new File(accessToken, siteName)
  const dataType = new DataType()
  FooterFile.setFileType(dataType)

  const NavigationFile = new File(accessToken, siteName)
  NavigationFile.setFileType(dataType)

  const HomepageFile = new File(accessToken, siteName)
  const homepageType = new HomepageType()
  HomepageFile.setFileType(homepageType)

  const fileRetrievalObj = {
    config: configResp.read(),
    footer: FooterFile.read(FOOTER_PATH),
    navigation: NavigationFile.read(NAVIGATION_PATH),
  }

  // Retrieve homepage only if flag is set to true
  if (shouldRetrieveHomepage) {
    fileRetrievalObj.homepage = HomepageFile.read(HOMEPAGE_INDEX_PATH);
  }


  const fileContentsArr = await Bluebird.map(Object.keys(fileRetrievalObj), async (fileOpKey) => {
    const { content, sha } = await fileRetrievalObj[fileOpKey]

    // homepage requires special extraction as the content is wrapped in front matter
    if (fileOpKey === 'homepage') {
      const homepageContent = Base64.decode(content)
      const homepageFrontMatterObj = yaml.safeLoad(homepageContent.split('---')[1])
      return { type: fileOpKey, content: homepageFrontMatterObj, sha }
    }

    return { type: fileOpKey, content: yaml.safeLoad(Base64.decode(content)), sha }
  })

  // Convert to an object so that data is accessible by key
  const fileContentsObj = {}
  fileContentsArr.forEach((fileObj) => {
    const { type, content, sha } = fileObj
    fileContentsObj[type] = { content, sha }
  })

  return {
    configResp,
    FooterFile,
    NavigationFile,
    HomepageFile,
    fileContentsObj,
  }
}

class Settings {
  constructor(accessToken, siteName) {
    this.accessToken = accessToken
    this.siteName = siteName
  }

  async get() {
    const { fileContentsObj: {
      config,
      footer,
      navigation,
    } } = await retrieveSettingsFiles(this.accessToken, this.siteName)

    // convert data to object form
    const configContent = config.content;
    const footerContent = footer.content;
    const navigationContent = navigation.content;

    // retrieve only the relevant config and index fields
    const configFieldsRequired = {
      url: configContent.url,
      title: configContent.title,
      favicon: configContent.favicon,
      shareicon: configContent.shareicon,
      is_government: configContent.is_government,
      facebook_pixel: configContent['facebook-pixel'],
      google_analytics: configContent.google_analytics,
      resources_name: configContent.resources_name,
      colors: configContent.colors,
    }

    // retrieve footer sha since we are sending the footer object wholesale
    const footerSha = footer.sha

    return ({
      configFieldsRequired,
      footerContent,
      navigationContent: { logo: navigationContent.logo },
      footerSha,
    })
  }
  
  async post(payload) {
    const {
      configResp,
      FooterFile,
      NavigationFile,
      HomepageFile,
      fileContentsObj: {
        config,
        footer,
        navigation,
        homepage,
      },
    } = await retrieveSettingsFiles(this.accessToken, this.siteName, true)

    // extract data
    const {
      footerSettings,
      configSettings,
      navigationSettings,
    } = payload

    // update settings objects
    const configContent = config.content
    const footerContent = footer.content
    const navigationContent = navigation.content

    const settingsObj = {}

    if (configSettings) {
      settingsObj.config = {
        payload: configSettings,
        currentData: configContent,
      }
    }

    if (footerSettings) {
      settingsObj.footer = {
        payload: footerSettings,
        currentData: footerContent,
      }
    }
    
    if (navigationSettings) {
      settingsObj.navigation = {
        payload: navigationSettings,
        currentData: navigationContent,
      }
    }

    const updatedSettingsObjArr = Object.keys(settingsObj).map((settingsObjKey) => {
      const { payload, currentData } = settingsObj[settingsObjKey]
      const clonedSettingsObj = _.cloneDeep(currentData);
      Object.keys(payload).forEach((setting) => (clonedSettingsObj[setting] = payload[setting]));
      return {
        type: settingsObjKey,
        settingsObj: clonedSettingsObj,
      }
    })

    const updatedSettingsObj = {}
    updatedSettingsObjArr.forEach((setting) => {
      const { type, settingsObj } = setting
      updatedSettingsObj[`${type}SettingsObj`] = settingsObj
    })

    const { configSettingsObj, footerSettingsObj, navigationSettingsObj } = updatedSettingsObj

    // To-do: use Git Tree to speed up operations
    if (configSettings) {
      const newConfigContent = Base64.encode(yaml.safeDump(configSettingsObj))
      await configResp.update(newConfigContent, config.sha)

      // Update title in homepage as well if it's changed
      if (configContent.title !== configSettingsObj.title) {
        const { content: homepageContentObj, sha } = homepage;
        
        homepageContentObj.title = configSettings.title;
        const homepageFrontMatter = yaml.safeDump(homepageContentObj);

        const homepageContent = ['---\n', homepageFrontMatter, '---'].join('') ;
        const newHomepageContent = Base64.encode(homepageContent)

        await HomepageFile.update(HOMEPAGE_INDEX_PATH, newHomepageContent, sha)
      }
    }

    if (footerSettings) {
      const newFooterContent = Base64.encode(yaml.safeDump(footerSettingsObj))
      await FooterFile.update(FOOTER_PATH, newFooterContent, footer.sha)
    }

    if (navigationSettings) {
      const newNavigationContent = Base64.encode(yaml.safeDump(navigationSettingsObj))
      await NavigationFile.update(NAVIGATION_PATH, newNavigationContent, navigation.sha)
    }
    
    return
  }
}

module.exports = { Settings }