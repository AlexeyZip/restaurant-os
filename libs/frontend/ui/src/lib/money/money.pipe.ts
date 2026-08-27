import { Pipe, PipeTransform } from '@angular/core';
import { formatMoney } from '@restaurant-os/shared/util';

@Pipe({
  name: 'money',
})
export class MoneyPipe implements PipeTransform {
  transform(minorUnits: number): string {
    return formatMoney(minorUnits);
  }
}
