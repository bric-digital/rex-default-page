import { WebmunkConfiguration } from '@bric/webmunk-core/extension'
import webmunkCorePlugin, { WebmunkServiceWorkerModule, registerWebmunkModule } from '@bric/webmunk-core/service-worker'

class WebmunkDefaultPageModule extends WebmunkServiceWorkerModule {
  initialPage:string
  defaultPage:string
  listenerAdded:boolean = false

  moduleName() {
    return 'DefaultPageModule'
  }

  setup() {
    this.refreshConfiguration()
  }

  refreshConfiguration() {
    webmunkCorePlugin.fetchConfiguration()
      .then((configuration:WebmunkConfiguration) => {
        if (configuration !== undefined) {
          const defaultPageConfig = configuration['default_page']

          if (defaultPageConfig !== undefined) {
            this.updateConfiguration(defaultPageConfig)

            return
          }
        }

        setTimeout(() => {
          this.refreshConfiguration()
        }, 1000)
      })
  }

  updateConfiguration(config) {
    this.initialPage = config['initial_page']
    this.defaultPage = config['default_page']

    chrome.storage.local.get('webmunkDefaultPageOpenedInitial')
      .then((response) => {
        if (response.webmunkDefaultPageOpenedInitial === undefined) {
          chrome.storage.local.set({webmunkDefaultPageOpenedInitial: true})
          .then(() => {
            chrome.tabs.create({ url: this.initialPage });
          })
        }
      })

    if (this.listenerAdded === false) {
      chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete') {

        } else if (changeInfo.status === 'loading') {
          // Check if this is a new tab with blank/new tab URL and redirect if configured

          const emptyTabUrls = [
            'chrome://newtab/',
            'chrome://newtab',
            'about:blank',
            'chrome://new-tab-page/'
          ]

          if (emptyTabUrls.includes(tab.url)) {
            chrome.tabs.update(tabId, { url: this.defaultPage })
          }
        }
      })

      this.listenerAdded = true
    }
  }
}

const plugin = new WebmunkDefaultPageModule()

registerWebmunkModule(plugin)

export default plugin
