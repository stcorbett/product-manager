import { Controller } from "../node_modules/@hotwired/stimulus/dist/stimulus.js"
import Content from "./content.js"
import Params from "./params.js"

export default class extends Controller {
  static values = {
    library: String,
    all: Boolean
  }

  static targets = ["itemTemplate", "jobTitle"]

  connect () {
    this.contentItemsRendered = []
    this.version = this.filter(Params.key())
    this.content = ((Params.key() || '') == '') ? [] : this.filteredContent(this.libraryValue)
    this.content = this.replaceContent(this.content, this.libraryValue)

    this.render()
  }

  replaceContent(content, library) {
    if (this.version == undefined) {
      return content
    }

    let replacements = (this.version.replace || {})
    let replacementKeys = Object.keys(replacements).filter(replace => replace.startsWith(library))
    if(!replacementKeys){ return content }

    replacementKeys.forEach(replace => {
      content.filter(item => replace.startsWith(`${library}-${item.name}-`)).forEach(namedItem => {
        let property = replace.replace(`${library}-${namedItem.name}-`, '')
        // console.log(library, " replacing ", namedItem.name, ' ', property, ' : ', replacements[replace])
        namedItem[property] = replacements[replace]
      })
    })

    return content
  }

  filter (key) {
    return Content.versions.find(version => (version.urlParam == key) || (version.path == key))
  }

  filteredContent(library) {
    if (this.version == 'all') { return Content[library] }

    let version = this.version || {}
    let renderAll = this.allValue || version[`${library}Content`] == 'all'
    let includedFilter = version[`${library}Content`]
    if(includedFilter && (includedFilter.constructor === String)) { includedFilter = [includedFilter]}

    if (renderAll) {
      return Content[library]
    } else if (includedFilter == undefined) {
      return []
    } else {
      return includedFilter.map(name => Content[library].find(item => item.name == name)).filter(item => item)
    }
  }

  render() {
    this.content.forEach(contentItem => {
      let item = this.itemTemplateTarget.content ? this.itemTemplateTarget.content.cloneNode(true) : undefined
      let template

      if(((contentItem.htmlTitle || '').length > 0)) {
        document.title = contentItem.htmlTitle
      }
      if((contentItem.title || '').length > 0) {
        item.querySelector('[data-content="title"]').innerHTML = contentItem.title
      }
      if((contentItem.subTitle || '').length > 0) {
        item.querySelector('[data-content="subTitle"]').innerHTML = contentItem.subTitle
      }
      if((contentItem.addlTitle || '').length > 0) {
        item.querySelector('[data-content="addlTitle"]').innerHTML = contentItem.addlTitle
      }
      if((contentItem.description || '').length > 0) {
        item.querySelector('[data-content="description"]').innerHTML = contentItem.description
      }
      if((contentItem.closer || '').length > 0) {
        item.querySelector('[data-content="closer"]').innerHTML = contentItem.closer
      }
      if((contentItem.skills || '').length > 0) {
        item.querySelector('[data-content="skills"]').innerHTML = contentItem.skills
      }

      if((contentItem.image || '').length > 0) {
        item.querySelector('[data-content="image"]').classList.remove('d-none')
        item.querySelector('[data-content="image-template"]').src = contentItem.image

        if((contentItem.imageLink || '').length > 0) {
          item.querySelector('[data-content="image"]').href = contentItem.imageLink
          item.querySelector('[data-content="image"]').target = "_blank"
        }
      }

      if((contentItem.images || '').length > 0) {
        item.querySelector('[data-content="image"]').classList.remove('d-none')

        template = item.querySelector('[data-content="image-template"]')
        template.src = contentItem.images[0]

        contentItem.images.slice(1).forEach(image => {
          let clone = template.cloneNode(true)
          clone.src = image
          clone.classList.remove("w-100")
          clone.classList.add("w-25")
          template.after(clone);
        })
      }

      if (item) {
        item = this.renderDetail(item, contentItem)

        this.itemTemplateTarget.before(item)
      }
    });

    this.renderTitles()
  }

  renderTitles() {
    if (this.hasJobTitleTarget && this.version.jobTitle) {
      this.jobTitleTarget.innerHTML = this.version.jobTitle
    }
  }

  renderDetail(item, contentItem) {
    let itemLi = item.querySelector('[data-content="content-li"]')
    let detailLi

    (contentItem.content || []).forEach(detail => {
      if(this.contentItemsRendered.includes(detail)) { return }
      detailLi = itemLi.cloneNode(true)
      detailLi.innerHTML = detail
      itemLi.before(detailLi)

      this.contentItemsRendered.push(detail)
    })

    itemLi.remove()
    return item
  }
}
