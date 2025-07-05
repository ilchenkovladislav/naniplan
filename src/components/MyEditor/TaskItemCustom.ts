import {
  type KeyboardShortcutCommand,
  mergeAttributes,
  Node,
  wrappingInputRule,
} from '@tiptap/core'
import { Node as ProseMirrorNode } from '@tiptap/core'
// import { Node as ProseMirrorNode } from '@tiptap/pm/model'

export interface TaskItemOptions {
  /**
   * A callback function that is called when the checkbox is clicked while the editor is in readonly mode.
   */
  onReadOnlyChecked?: (node: ProseMirrorNode, checked: boolean) => boolean

  /**
   * Controls whether the task items can be nested or not.
   */
  nested: boolean

  /**
   * HTML attributes to add to the task item element.
   */
  HTMLAttributes: Record<string, any>

  /**
   * The node type for taskList nodes
   */
  taskListTypeName: string
}

/**
 * Matches a task item to a - [ ] on input.
 */
export const inputRegex = /^\s*(\[([( |x])?\])\s$/

/**
 * This extension allows you to create task items with custom checkbox.
 */
export const TaskItemCustom = Node.create<TaskItemOptions>({
  name: 'taskItem',

  addOptions() {
    return {
      nested: false,
      HTMLAttributes: {},
      taskListTypeName: 'taskList',
    }
  },

  content() {
    return this.options.nested ? 'paragraph block*' : 'paragraph+'
  },

  defining: true,

  addAttributes() {
    return {
      checked: {
        default: false,
        keepOnSplit: false,
        parseHTML: (element) => {
          const dataChecked = element.getAttribute('data-checked')
          return dataChecked === '' || dataChecked === 'true'
        },
        renderHTML: (attributes) => ({
          'data-checked': attributes.checked,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: `li[data-type="${this.name}"]`,
        priority: 51,
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const checkboxId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    return [
      'li',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': this.name,
      }),
      [
        'div',
        { class: 'checkbox' },
        [
          'input',
          {
            type: 'checkbox',
            class: 'check',
            id: checkboxId,
            checked: node.attrs.checked ? 'checked' : null,
          },
        ],
        [
          'label',
          { for: checkboxId, class: 'label' },
          [
            'svg',
            {
              width: '50',
              height: '50',
              viewBox: '0 0 100 100',
            },
            [
              'rect',
              {
                x: '30',
                y: '20',
                width: '50',
                height: '50',
                stroke: 'black',
                fill: 'none',
              },
            ],
            [
              'g',
              { transform: 'translate(0,-952.36222)' },
              [
                'path',
                {
                  d: 'm 56,963 c -102,122 6,9 7,9 17,-5 -66,69 -38,52 122,-77 -7,14 18,4 29,-11 45,-43 23,-4 ',
                  stroke: 'black',
                  'stroke-width': '3',
                  fill: 'none',
                  class: 'path1',
                },
              ],
            ],
          ],
        ],
      ],
      ['div', 0],
    ]
  },

  addKeyboardShortcuts() {
    const shortcuts: {
      [key: string]: KeyboardShortcutCommand
    } = {
      Enter: () => this.editor.commands.splitListItem(this.name),
      'Shift-Tab': () => this.editor.commands.liftListItem(this.name),
    }

    if (!this.options.nested) {
      return shortcuts
    }

    return {
      ...shortcuts,
      Tab: () => this.editor.commands.sinkListItem(this.name),
    }
  },

  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const listItem = document.createElement('li')
      const checkboxWrapper = document.createElement('div')
      const checkbox = document.createElement('input')
      const label = document.createElement('label')
      const content = document.createElement('div')

      // Генерируем уникальный ID для связи checkbox и label
      const checkboxId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Настройка wrapper
      checkboxWrapper.className = 'checkbox'
      checkboxWrapper.contentEditable = 'false'

      // Настройка checkbox
      checkbox.type = 'checkbox'
      checkbox.className = 'check'
      checkbox.id = checkboxId
      checkbox.checked = node.attrs.checked

      // Настройка label
      label.htmlFor = checkboxId
      label.className = 'label'

      // Создание SVG элемента
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('width', '50')
      svg.setAttribute('height', '50')
      svg.setAttribute('viewBox', '0 0 100 100')

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('x', '30')
      rect.setAttribute('y', '20')
      rect.setAttribute('width', '50')
      rect.setAttribute('height', '50')
      rect.setAttribute('stroke', 'oklch(64.6% 0.222 41.116)')
      rect.setAttribute('fill', 'none')

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      g.setAttribute('transform', 'translate(0,-952.36222)')

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute(
        'd',
        'm 56,963 c -102,122 6,9 7,9 17,-5 -66,69 -38,52 122,-77 -7,14 18,4 29,-11 45,-43 23,-4 ',
      )
      path.setAttribute('stroke', 'oklch(64.6% 0.222 41.116)')
      path.setAttribute('stroke-width', '3')
      path.setAttribute('fill', 'none')
      path.setAttribute('class', 'path1')

      g.appendChild(path)
      svg.appendChild(rect)
      svg.appendChild(g)
      label.appendChild(svg)

      // Обработчик событий
      checkbox.addEventListener('mousedown', (event) => event.preventDefault())
      checkbox.addEventListener('change', (event) => {
        if (!editor.isEditable && !this.options.onReadOnlyChecked) {
          checkbox.checked = !checkbox.checked
          return
        }

        const { checked } = event.target as any

        if (editor.isEditable && typeof getPos === 'function') {
          editor
            .chain()
            .focus(undefined, { scrollIntoView: false })
            .command(({ tr }) => {
              const position = getPos()
              if (typeof position !== 'number') {
                return false
              }
              const currentNode = tr.doc.nodeAt(position)
              tr.setNodeMarkup(position, undefined, {
                ...currentNode?.attrs,
                checked,
              })
              return true
            })
            .run()
        }

        if (!editor.isEditable && this.options.onReadOnlyChecked) {
          if (!this.options.onReadOnlyChecked(node, checked)) {
            checkbox.checked = !checkbox.checked
          }
        }
      })

      // Сборка элементов
      checkboxWrapper.appendChild(checkbox)
      checkboxWrapper.appendChild(label)
      listItem.appendChild(checkboxWrapper)
      listItem.appendChild(content)

      // Применение атрибутов
      Object.entries(this.options.HTMLAttributes).forEach(([key, value]) => {
        listItem.setAttribute(key, value)
      })

      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        listItem.setAttribute(key, value)
      })

      listItem.dataset.checked = node.attrs.checked.toString()

      return {
        dom: listItem,
        contentDOM: content,
        update: (updatedNode) => {
          if (updatedNode.type !== this.type) {
            return false
          }

          listItem.dataset.checked = updatedNode.attrs.checked.toString()
          checkbox.checked = updatedNode.attrs.checked

          return true
        },
      }
    }
  },

  addInputRules() {
    return [
      wrappingInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match) => ({
          checked: match[match.length - 1] === 'x',
        }),
      }),
    ]
  },
})
