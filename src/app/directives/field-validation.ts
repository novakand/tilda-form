import {
  Directive,
  ElementRef,
  Renderer2,
  AfterContentInit,
  DoCheck,
  OnDestroy,
  Input,
  ContentChild
} from '@angular/core';
import { NgControl, AbstractControl } from '@angular/forms';

@Directive({
  selector: '[appFieldValidation]',
  standalone: true
})
export class FieldValidationDirective implements AfterContentInit, DoCheck, OnDestroy {
  @Input('appFieldValidation')
  set errorMessages(val: Record<string, any> | null | undefined) {
    this._overrides = val ?? {};
  }
  private _overrides: Record<string, any> = {};
  private defaultErrorMessages = {
    required: 'This field is required',
    minlength: (error: any) => `The field value must be: from ${error.requiredLength} characters`,
    maxlength: (error: any) => `The field value must be: no more than ${error.requiredLength} characters`,
    pattern: (error: any) => 'Enter date in dd.mm.yyyy hh:mm format',
    serverError: (error: any) => error,
    min: 'This field is required',
  };

  @ContentChild(NgControl, { static: true }) controlDir!: NgControl;
  private control!: AbstractControl;
  private errorContainer!: HTMLElement;
  private labelEl: HTMLElement | null = null;
  private inputEl!: HTMLElement;
  private wrapper!: HTMLElement;

  constructor(
    private host: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) { }

  ngAfterContentInit() {
    this.control = this.controlDir.control!;
    this.wrapper = this.host.nativeElement;

    if (getComputedStyle(this.wrapper).position === 'static') {
      this.renderer.setStyle(this.wrapper, 'position', 'relative');
    }

    this.inputEl = this.findInputElement();
    this.labelEl = this.findLabel();

    if (this.control.validator?.({ value: null } as any)?.['required'] && this.labelEl) {
      this.addRequiredStar();
    }

    this.createErrorContainer();
  }

  private findInputElement(): HTMLElement {
    // Ищем input в разных вариантах
    return this.wrapper.querySelector('input.p-inputtext, input, p-iconfield input, p-select .p-dropdown') as HTMLElement;
  }

  private findLabel(): HTMLElement | null {
    // 1. Ищем label внутри wrapper
    const label = this.wrapper.querySelector('label');
    if (label) return label as HTMLElement;

    // 2. Ищем label по id/inputId
    const inputId = this.inputEl.id || this.inputEl.getAttribute('inputId');
    if (inputId) {
      return document.querySelector(`label[for="${inputId}"]`);
    }

    return null;
  }

  private addRequiredStar() {
    if (!this.labelEl) return;

    const star = this.renderer.createElement('span');
    this.renderer.setStyle(star, 'color', 'var(--p-red-400)');
    this.renderer.setStyle(star, 'margin-left', '4px');
    this.renderer.appendChild(star, this.renderer.createText('*'));
    this.renderer.appendChild(this.labelEl, star);
  }

  private createErrorContainer() {
    this.errorContainer = this.renderer.createElement('div');
    this.renderer.setStyle(this.errorContainer, 'position', 'absolute');
    this.renderer.setStyle(this.errorContainer, 'top', '100%');
    this.renderer.setStyle(this.errorContainer, 'left', '0');
    this.renderer.setStyle(this.errorContainer, 'width', '100%');
    this.renderer.setStyle(this.errorContainer, 'pointer-events', 'none');
    this.wrapper.appendChild(this.errorContainer);
  }

  ngDoCheck() {
    if (!this.control || !this.inputEl || !this.errorContainer) {
      return;
    }

    const invalid = this.control.invalid && (this.control.touched || this.control.dirty);
    const targetElement = this.inputEl.closest('p-iconfield, p-select') || this.inputEl;

    // Добавляем/удаляем класс ошибки
    if (invalid) {
      this.renderer.addClass(targetElement, 'p-invalid');
    } else {
      this.renderer.removeClass(targetElement, 'p-invalid');
    }

    // Обновляем сообщения об ошибках
    this.updateErrorMessages(invalid);
  }

  private updateErrorMessages(invalid: boolean) {
    // Очищаем старые сообщения
    while (this.errorContainer.firstChild) {
      this.errorContainer.removeChild(this.errorContainer.firstChild);
    }

    // Добавляем новое сообщение если есть ошибка
    if (invalid && this.control.errors) {
      const key = Object.keys(this.control.errors)[0];
      const val = this.control.errors[key];
      const custom = this._overrides[key];
      const tmpl = custom ?? (this.defaultErrorMessages as any)[key];
      const msg = typeof tmpl === 'function' ? tmpl(val) : (tmpl as string);

      const errorElem = this.renderer.createElement('small');
      this.renderer.addClass(errorElem, 'required-error');
      this.renderer.setStyle(errorElem, 'color', 'var(--p-red-400)');
      this.renderer.setStyle(errorElem, 'font-size', '12px');
      this.renderer.appendChild(errorElem, this.renderer.createText(msg));
      this.renderer.appendChild(this.errorContainer, errorElem);
    }
  }

  ngOnDestroy() { }
}