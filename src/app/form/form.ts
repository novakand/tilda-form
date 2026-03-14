import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { CommonModule } from '@angular/common';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { RadioButton } from 'primeng/radiobutton';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import libPhoneNumber from 'google-libphonenumber';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FieldValidationDirective } from '../directives/field-validation';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DatePickerModule } from 'primeng/datepicker';
import { delay } from 'rxjs';
export enum PhoneNumberTypeEnum {
  FIXED_LINE = 0,
  MOBILE = 1,
  FIXED_LINE_OR_MOBILE = 2,
  TOLL_FREE = 3,
  PREMIUM_RATE = 4,
  SHARED_COST = 5,
  VOIP = 6,
  PERSONAL_NUMBER = 7,
  PAGER = 8,
  UAN = 9,
  VOICEMAIL = 10,
  UNKNOWN = -1
}

const phoneUtil = libPhoneNumber.PhoneNumberUtil.getInstance();
const PhoneNumberType = libPhoneNumber.PhoneNumberType;

@Component({
  selector: 'app-form',
  imports: [CommonModule,
    TabsModule,
    StepperModule,
    ButtonModule,
    RadioButton,
    FormsModule,
    CheckboxModule,
    InputTextModule,
    ReactiveFormsModule,
    IconFieldModule,
    InputIconModule,
    FieldValidationDirective,
    ScrollPanelModule,
    DatePickerModule
  ],
  templateUrl: './form.html',
  standalone: true,
  styleUrl: './form.scss',
})
export class Form implements OnInit {
  panelHeight = 0;
  today = new Date();

  @ViewChildren('panelWrapper') panelWrappers!: QueryList<ElementRef>;
  isMobile = window.innerWidth < 768;

  @HostListener('window:resize')

  onStepChange() {
    //  console.log('kkk')

    setTimeout(() => {
      this.updateHeight();
    });

  }

  updateHeight() {

    const panel = this.panelWrappers?.last;

    if (!panel) return;
    // console.log('g')

    const rect = panel.nativeElement.getBoundingClientRect();

    const offsetBottom = 400;

    this.panelHeight = window.innerHeight - rect.top - offsetBottom;
    //console.log(this.panelHeight, 'this.panelHeight')

    this.cdr.detectChanges();

  }

  public errorMessages = {
    minlength: (error: any) =>
      'The field value must be at least ' + error.requiredLength + ' characters long',
    pattern: 'Please enter a valid email address',
    invalidPhone: 'Please check the number of digits in your phone number',
  };

  private messageListener!: (event: MessageEvent) => void;
  public sending = false;
  constructor(private fb: FormBuilder, private el: ElementRef,
    private cdr: ChangeDetectorRef) {
    this.buildForm();
  }


  ngAfterViewInit() {
    this.panelWrappers.changes
      .pipe(
        delay(0) // дождаться рендера
      )
      .subscribe((data) => {
        //  console.log('panelWrappers', data)
        this.updateHeight();
      });

    // первый рендер
    this.updateHeight();
  }

  @HostListener('window:resize')
  onResize() {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.updateHeight();
    }, 100);

    this.isMobile = window.innerWidth < 768;
  }

  private resizeTimer: any;

  ngOnInit() {

    this.messageListener = (event: MessageEvent) => {

      console.log("📨 Message received from parent:", event.data);

      if (event.data?.type === 'tv-form-success') {

        console.log("✅ Form successfully sent via Tilda");

        this.showSuccessScreen();

      }

    };

    window.addEventListener('message', this.messageListener);

  }

  public ngOnDestroy() {
    window.removeEventListener('message', this.messageListener);
  }

  public formSent = false;

  selectInstallation(option: string) {

    this.form.patchValue({
      installationTime: option
    });

    if (option !== 'This week') {
      this.form.patchValue({
        installationDate: null
      });
    }

  }

  showSuccessScreen() {
    this.sending = false;
    // this.formSent = true;
  }

  public form!: FormGroup;

  public activeStep = 0;

  public categories = [
    { key: '1', name: 'Mounting of One TV', count: 1 },
    { key: '2', name: 'Mounting of Two TVs', count: 2 },
    { key: '3', name: 'Mounting of Three TVs', count: 3 },
    { key: '4', name: 'Mounting of Four TVs', count: 4 },
    { key: '5', name: 'Mounting of Five TVs', count: 5 }
  ];


  getTvForm(index: number): FormGroup {
    return this.tvArray.at(index) as FormGroup;
  }

  public tvSizes = [
    { label: '42” or Smaller', price: 69 },
    { label: '43”–59”', price: 109 },
    { label: '60” or Larger (1 Tech + Your Help)', price: 139 },
    { label: '60” or Larger (2 Techs)', price: 169 }
  ];

  public mountTypes = [
    { label: 'Already Got Mount', price: 0 },
    { label: 'Fixed Mount', description: 'TV sits flat against the wall with no movement.', price: 49 },
    { label: 'Tilt Mount', description: 'TV tilts up or down to improve the viewing angle.', price: 59 },
    {
      label: 'Full-Motion Mount',
      description: 'TV can extend, swivel, and tilt for flexible viewing angles.',
      price: 89
    }
  ];

  public wireOptions = [
    { label: 'Exposed Wires', price: 0 },
    { label: 'External Wire Concealment', description: 'Cables are hidden using a paintable wall cord cover.', price: 39 },
    { label: 'Internal Wire Concealment', description: 'Cables are routed inside the wall for a clean, wire-free look.', price: 89 },
    { label: 'Outlet Installation', price: 119 }
  ];

  public additionalServices = [
    { label: 'Install Mirror', price: 0 },
    { label: 'Soundbar', price: 69, description: 'Mount is not included in the price.' },
    { label: 'Dismount Existing TV', price: 39 },
    { label: 'Xbox or PlayStation', price: 69, description: 'Mount is not included in the price.' },
    { label: 'Install Wall Shelf', price: 49 }
  ];

  onPhoneInput(): void {

    let phone = this.phoneGroup.get('phoneNumber')?.value || '';

    if (phone && !phone.startsWith('+')) {
      phone = '+' + phone;

      this.phoneGroup.patchValue(
        { phoneNumber: phone },
        { emitEvent: false }
      );
    }

    try {

      const parsed = phoneUtil.parseAndKeepRawInput(phone, '');

      const isValid = phoneUtil.isValidNumber(parsed);

      const regionCode = phoneUtil.getRegionCodeForNumber(parsed);

      const dialCode = '+' + parsed.getCountryCode();

      const typeCode = phoneUtil.getNumberType(parsed);

      const typeLabel = PhoneNumberTypeEnum[typeCode];

      this.phoneGroup.patchValue({
        countryCode: regionCode,
        phoneCode: dialCode,
        type: typeLabel
      }, { emitEvent: false });

      this.phoneGroup.get('phoneNumber')?.setErrors(
        isValid ? null : { invalidPhone: true }
      );

    } catch {

      this.phoneGroup.patchValue({
        countryCode: null,
        phoneCode: null,
        type: null
      }, { emitEvent: false });

      this.phoneGroup.get('phoneNumber')?.setErrors({ invalidPhone: true });

    }

  }



  buildForm() {

    this.form = this.fb.group({
      installationTime: [null, Validators.required],
      installationDate: [null],
      category: [null, Validators.required],

      tvs: this.fb.array([]),

      contact: this.fb.group({
        address: [null, Validators.required],
        name: [null, Validators.required],
        email: new FormControl(null, [
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
          Validators.email
        ]),
        phone: this.fb.group({
          phoneCode: ['+1'],
          countryCode: ['US'],
          phoneNumber: ['+1', Validators.required],
          type: [PhoneNumberTypeEnum.UNKNOWN]
        }),
        policy: [false, Validators.requiredTrue]
      })

    });

  }

  get phoneGroup(): FormGroup {
    return this.contactForm.get('phone') as FormGroup;
  }

  get tvArray(): FormArray {
    return this.form.get('tvs') as FormArray;
  }

  get contactForm(): FormGroup {
    return this.form.get('contact') as FormGroup;
  }

  selectCategory(category: any) {

    this.form.patchValue({ category });

    this.tvArray.clear();

    for (let i = 0; i < category.count; i++) {

      this.tvArray.push(
        this.fb.group({
          size: [null, Validators.required],
          mount: [null],
          wires: [null],
          services: this.fb.control([])
        })
      );

    }

  }


  getServicesArray(index: number): FormArray {
    return this.tvArray.at(index).get('services') as FormArray;
  }

  toggleService(index: number, service: any) {

    const tv = this.tvArray.at(index) as FormGroup;

    const services = [...(tv.value.services || [])];

    const exists = services.find((s: any) => s === service);

    if (exists) {

      tv.patchValue({
        services: services.filter((s: any) => s !== service)
      });

    } else {

      tv.patchValue({
        services: [...services, service]
      });

    }

  }

  calculateTvTotal(tv: any) {

    let total = 0;

    if (tv.size) total += tv.size.price;
    if (tv.mount) total += tv.mount.price;
    if (tv.wires) total += tv.wires.price;

    if (tv.services?.length) {
      tv.services.forEach((s: any) => total += s.price);
    }

    return total;

  }

  calculateTotal() {

    let total = 0;

    this.tvArray.value.forEach((tv: any) => {

      total += this.calculateTvTotal(tv);

    });

    return total;

  }

  installationOptions = [
    'Today',
    'Tomorrow',
    'This week',
    'Just checking price'
  ];

  get installationStep() {
    return this.tvArray.length + 2;
  }

  get summaryStep() {
    return this.tvArray.length + 3;
  }

  get contactStep() {
    return this.tvArray.length + 4;
  }


  public onSubmit(): void {

    console.log("📤 Submit clicked");

    if (this.form.invalid) {

      console.warn("❌ Form invalid", this.form.value);

      this.form.markAllAsTouched();
      return;

    }

    this.sending = true;

    const payload = this.getFormPayload();

    console.log("📦 Payload to send:", payload);

    // Проверка iframe
    if (window.parent === window) {

      console.warn("⚠️ Form is not inside iframe. postMessage skipped");

      return;

    }

    try {

      window.parent.postMessage({
        type: 'tv-mounting-form',
        data: payload
      }, '*');

      console.log("✅ postMessage sent");

    } catch (err) {

      console.error("❌ postMessage failed", err);

      this.sending = false;

    }

  }

  getFormPayload() {

    const form = this.form.value;

    const payload = {

      tvCount: form.category?.count,
      total: this.calculateTotal(),
      address: form.contact.address,
      email: form.contact.email,
      installationTime: form.installationTime,
      installationDate: form.installationDate,
      name: form.contact.name,
      phone: form.contact.phone.phoneNumber,
      tvDetails: form.tvs.map((tv: any, index: number) => {

        const services = tv.services?.map((s: any) => s.label).join(', ') || '';

        return `
TV ${index + 1}
Size: ${tv.size?.label}
Mount: ${tv.mount?.label}
Wires: ${tv.wires?.label}
Services: ${services}
      `;

      }).join('\n\n')

    };

    console.log("📦 Generated payload:", payload);

    return payload;

  }


}