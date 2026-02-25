import { REXConfiguration } from '@bric/rex-core/extension'
import rexCorePlugin, { REXServiceWorkerModule, registerREXModule } from '@bric/rex-core/service-worker'

class WebmunkDefaultPageModule extends REXServiceWorkerModule {
  initialPage:string
  defaultPage:string
  listenerAdded:boolean = false
  tabListener: Parameters<typeof chrome.tabs.onUpdated.addListener>[0] | null = null

  moduleName() {
    return 'DefaultPageModule'
  }

  setup() {
    this.refreshConfiguration()
  }

  refreshConfiguration() {
    rexCorePlugin.fetchConfiguration()
      .then((configuration:REXConfiguration) => {
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
    if (config['enabled'] === false) {
      if (this.listenerAdded && this.tabListener !== null) {
        chrome.tabs.onUpdated.removeListener(this.tabListener)
        this.tabListener = null
        this.listenerAdded = false
      }

      return
    }

    this.initialPage = config['initial_page']
    this.defaultPage = config['default_page']

    chrome.storage.local.get('webmunkDefaultPageOpenedInitial')
      .then((response) => {
        if (response.webmunkDefaultPageOpenedInitial === undefined) {
          chrome.storage.local.set({webmunkDefaultPageOpenedInitial: true})
          .then(() => {
            if (this.initialPage) {
              chrome.tabs.create({ url: this.initialPage });
            }
          })
        }
      })

    if (this.listenerAdded === false) {
      this.tabListener = (tabId, changeInfo, tab) => {
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
      }

      chrome.tabs.onUpdated.addListener(this.tabListener)

      this.listenerAdded = true
    }
  }
}

const plugin = new WebmunkDefaultPageModule()

registerREXModule(plugin)

export default plugin
