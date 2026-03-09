import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { CommonModule } from '@angular/common';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { RadioButton } from 'primeng/radiobutton';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';


@Component({
  selector: 'app-form',
  imports: [CommonModule, TabsModule, StepperModule, ButtonModule, RadioButton, FormsModule, CheckboxModule, InputTextModule],
  templateUrl: './form.html',
  standalone: true,
  styleUrl: './form.scss',
})
export class Form {
  selectedCategory: any = null;

  tvCount = 0;

  tvs: any[] = [];

  categories: any[] = [
    { name: 'Mounting of one TV', count: 1, key: 'A' },
    { name: 'Mounting of two TVs', count: 2, key: 'B' },
    { name: 'Mounting of three TVs', count: 3, key: 'C' },
    { name: 'Mounting of four TVs', count: 4, key: 'D' },
    { name: 'Mounting of five TVs', count: 5, key: 'E' }
  ];


  tvSizes = [
    { label: '42” or Smaller', price: 69 },
    { label: '43” – 59”', price: 109 },
    { label: '60” or Larger (1 tech and your help)', price: 139 },
    { label: '60” or Larger (2 techs)', price: 169 }
  ];

  mountTypes = [
    { label: 'Already got mount', price: 0 },
    { label: 'Fix mount', price: 49 },
    { label: 'Tilt mount', price: 59 },
    { label: 'Full motion mount', price: 89 }
  ];

  wireOptions = [
    { label: 'Exposed wires', price: 0 },
    { label: 'External cord concealment', price: 39 },
    { label: 'In-wall cord concealment', price: 89 },
    { label: 'Outlet installation', price: 119 }
  ];

  additionalServices = [
    { label: 'Soundbar', price: 69 },
    { label: 'Dismount existing TV', price: 39 },
    { label: 'Xbox or Playstation', price: 69 },
    { label: 'Install wall shelf', price: 49 }
  ];

  totalPrice = 0;

  calculateTotal() {

    let total = 0;

    this.tvs.forEach(tv => {

      if (tv.size) total += tv.size.price;

      if (tv.mount) total += tv.mount.price;

      if (tv.wires) total += tv.wires.price;

      if (tv.services?.length) {
        tv.services.forEach((s: any) => total += s.price);
      }

    });

    this.totalPrice = total;

    return total;

  }


  selectCategory(category: any) {

    this.selectedCategory = category;

    this.tvCount = category.count;

    this.tvs = Array.from({ length: this.tvCount }, (_, i) => ({
      index: i + 1,
      size: null,
      mount: null,
      wires: null,
      services: []
    }));

  }


  toggleService(tv: any, service: any) {

    const exists = tv.services?.find((s: any) => s === service);

    if (exists) {
      tv.services = tv.services.filter((s: any) => s !== service);
    } else {
      tv.services = [...(tv.services || []), service];
    }

    this.calculateTotal();

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
}
