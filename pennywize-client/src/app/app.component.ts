import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild('install') install: TemplateRef<any>;

  constructor(private d: MatDialog) { }

  ngOnInit() {
    window.addEventListener('beforeinstallprompt', async (e: any) => {
      console.log(e);
      const res: boolean = await this.d.open(this.install).afterClosed().toPromise();
      console.log(res);
      const promptRes = await e.prompt();
      console.log(promptRes);
    });
  }
}
