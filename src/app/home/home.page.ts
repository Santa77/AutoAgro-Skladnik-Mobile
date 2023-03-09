import {
  Component,
  AfterViewInit,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { Zeroconf } from '@awesome-cordova-plugins/zeroconf/ngx';
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import { Platform } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { OasisService } from '../api/oasis.service';
import { IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {
  public isLoading = false;
  public isConnecting = true;
  public isBase = false;
  public isKarty = false;
  public isManual = false;
  public baseUrl = 'http://127.0.0.1:2212';
  public karty: any;
  public hladam: string = '';
  public typHladania: any = '1';

  typyHladania: any[] = [
    {
      "value":"1",
      "label":"V kóde",
    },
    {
      "value":"2",
      "label":"V názve",
    },
    
  ];

  constructor(
    private zeroconf: Zeroconf,
    private cdr: ChangeDetectorRef,
    private barcodeScanner: BarcodeScanner,
    private platform: Platform,
    private alertController: AlertController,
    public oasisService: OasisService
  ) {}

  setIsNone(){
    this.isLoading = false;
    this.isConnecting = false;
    this.isBase = false;
    this.isKarty = false;
    this.isManual = false;
  }

  ngAfterViewInit() {
    // watch for services of a specified type
    try {
      this.zeroconf.watch('_http._tcp.', 'local.').subscribe((result) => {
        // console.log(result.action);
        // console.log(result.service);
        if (result.action == 'resolved') {
          console.log('service resolved', result.service);
          if (
            result.service.name == 'Mobilny skladnik OASIS' &&
            this.isConnecting &&
            result.service.ipv4Addresses.length > 0
          ) {
            this.setIsNone();
            this.isBase = true;
            this.baseUrl =
              'http://' +
              result.service.ipv4Addresses[0] +
              ':' +
              result.service.port;
            console.log('URL: ' + this.baseUrl);
            this.oasisService.API_URL = this.baseUrl;
          }
        }
        if (result.action == 'added') {
          console.log('service added', result.service);
        }
        if (result.action == 'removed') {
          console.log('service removed', result.service);
        }
        this.cdr.detectChanges();
      });
    } catch (error) {
      console.error(error);
    }
    this.cdr.detectChanges();
    if (this.platform.is('capacitor')) {
      // application is running on a device using Capacitor
    } else {
      // application is running in a browser
      this.setIsNone();
      this.isBase = true;
      this.cdr.detectChanges();
    }
  }

  async doAlert(header: any, subHeader: any, message: any) {
    const alert = await this.alertController.create({
      header: header,
      subHeader: subHeader,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  doScan() {
    if (this.platform.is('capacitor')) {
      // application is running on a device using Capacitor
      this.barcodeScanner
        .scan({
          showTorchButton: true,
          torchOn: true,
          formats: 'CODE_128,CODE_39',
        })
        .then((barcodeData) => {
          console.log('Barcode data', barcodeData);
          if (!barcodeData.cancelled && barcodeData.format == 'CODE_128') {
            this.isLoading = true;
            this.getData(barcodeData.text);
            this.cdr.detectChanges();
          } else {
            this.doAlert(
              'Upozornenie',
              'Chyba kódu',
              'Nepodarilo sa naskenovať validný kód!'
            );
            this.isConnecting = false;
            this.isLoading = false;
            this.isBase = true;
            this.cdr.detectChanges();
          }
        })
        .catch((err) => {
          console.log('Error', err);
          this.doAlert('Chyba', 'Chyba skeneru', err);
          this.isConnecting = false;
          this.isLoading = false;
          this.isBase = true;
          this.cdr.detectChanges();
        });
    } else {
      // application is running in a browser
      this.isLoading = true;
      this.getData('1-60*');
      this.cdr.detectChanges();
    }
  }

  getData(id: any) {
    this.isLoading = true;
    this.isConnecting = false;
    this.isKarty = false;
    this.isBase = false;
    this.cdr.detectChanges();
    this.oasisService.najdiKarty(id).subscribe(
      (data) => {
        console.log(data);
        this.karty = data;
        this.isKarty = true;
      },
      (error) => {
        console.error(error);
        this.isLoading = false;
        this.isConnecting = false;
        this.isKarty = false;
        this.isBase = true;
        this.cdr.detectChanges();
      }
    );
  }

  getData2(id: any) {
    this.isLoading = true;
    this.isConnecting = false;
    this.isKarty = false;
    this.isBase = false;
    this.cdr.detectChanges();
    this.oasisService.najdiKarty2(id, this.typHladania).subscribe(
      (data) => {
        console.log(data);
        this.karty = data;
        this.isKarty = true;
      },
      (error) => {
        console.error(error);
        this.isLoading = false;
        this.isConnecting = false;
        this.isKarty = false;
        this.isBase = true;
        this.cdr.detectChanges();
      }
    );
  }

  showData() {}

  doSearch() {
    this.isConnecting = false;
    this.isLoading = true;
    this.isBase = false;
    this.isKarty = false;
    this.isManual = false;
    this.getData2(this.hladam);
    this.cdr.detectChanges();

  }

  doManual(){
    this.isConnecting = false;
    this.isLoading = false;
    this.isBase = false;
    this.isKarty = false;
    this.isManual = true;
    this.cdr.detectChanges();
  }


  cancelKarty() {
    this.isConnecting = false;
    this.isLoading = false;
    this.isBase = true;
    this.isKarty = false;
    this.isManual = false;
    this.cdr.detectChanges();
  }


  cancelManual() {
    this.isConnecting = false;
    this.isLoading = false;
    this.isBase = true;
    this.isKarty = false;
    this.isManual = false;
    this.cdr.detectChanges();
  }

}
