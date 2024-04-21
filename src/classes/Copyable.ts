import { Listenable } from './Listenable'
import type { ListenEffect } from './Listenable'

export type CopyableOptions = Record<never, never>

export type CopyableStatus = 'ready' | 'copying' | 'copied' | 'errored'

/**
 * [Docs](https://baleada.dev/docs/logic/classes/copyable)
 */
export class Copyable {
  private computedIsClipboardText: boolean
  private copyListenable: Listenable<'copy'>
  private cutListenable: Listenable<'cut'>
  private copyAndCutEffect: ListenEffect<'copy' | 'cut'>

  constructor (string: string, options: CopyableOptions = {}) {
    this.computedIsClipboardText = false

    this.copyListenable = new Listenable('copy')
    this.cutListenable = new Listenable('cut')

    this.copyAndCutEffect = async () => {
      const clipboardText = await navigator.clipboard.readText()
      this.computedIsClipboardText = clipboardText === this.string
    }

    this.setString(string)
    this.ready()
  }
  private computedStatus: CopyableStatus
  private ready () {
    this.computedStatus = 'ready'
  }

  get string () {
    return this.computedString
  }
  set string (string) {
    this.setString(string)
  }
  get status () {
    return this.computedStatus
  }
  get isClipboardText () {
    return this.computedIsClipboardText
  }
  get response () {
    return this.computedResponse
  }
  get error () {
    return this.computedError
  }

  private computedString: string
  setString (string: string) {
    this.computedString = string
    return this
  }

  private computedResponse: undefined
  private computedError: Error
  async copy (options: { kind: 'clipboard' | 'deprecated' } = { kind: 'clipboard' }) {
    this.copying()

    const { kind } = options

    switch (kind) {
      case 'clipboard':
        try {
          this.computedResponse = await navigator.clipboard.writeText(this.string) as undefined

          this.computedIsClipboardText = true

          this.copied()
        } catch (error) {
          this.computedError = error as Error
          this.errored()
        }

        break
      case 'deprecated':
        const input = document.createElement('input')
        input.type = 'text'
        input.value = this.string

        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')

        document.body.removeChild(input)

        this.computedIsClipboardText = true

        this.copied()
        break
    }

    return this
  }
  private copying () {
    this.computedStatus = 'copying'
  }
  private copied () {
    this.computedStatus = 'copied'
  }
  private errored () {
    this.computedStatus = 'errored'
  }

  listenForClipboardEvents () {
    this.copyListenable.listen(this.copyAndCutEffect)
    this.cutListenable.listen(this.copyAndCutEffect)
  }

  stop () {
    this.copyListenable.stop()
    this.cutListenable.stop()
  }
}
