import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.css', '../legal.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyComponent { }
