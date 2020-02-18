import { Component, OnInit, Inject } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { AppState } from 'src/app/app.state';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Md5 } from 'ts-md5';

@Component({
  selector: 'app-password-dialog',
  templateUrl: './password-dialog.component.html',
  styleUrls: ['./password-dialog.component.scss']
})
export class PasswordDialogComponent implements OnInit {

  hesloForm: FormGroup;
  error = '';
  loading: boolean;

  constructor(
    public dialogRef: MatDialogRef<PasswordDialogComponent>,
    private formBuilder: FormBuilder,
    public state: AppState,
    private service: AppService) { }

  ngOnInit() {
    this.hesloForm = this.formBuilder.group({
      oldheslo: ['', Validators.required],
      newheslo: ['', Validators.required]
    });
  }

  get f() { return this.hesloForm.controls; }

  onSubmit() {
    if (this.hesloForm.invalid) {
        return;
    }
    const data = {
      id: this.state.user.id,
      oldheslo: '' + Md5.hashStr(this.f.oldheslo.value),
      newheslo: '' + Md5.hashStr(this.f.newheslo.value)
    };

    this.loading = true;
    this.service.resetHeslo(data).subscribe(resp => {
      if (resp.error) {
        //this.toastService.show('heslo.reset_heslo_error', 4000, 'red');
        this.error = resp.error;
        this.loading = false;
      } else {
        this.loading = false;
        //this.toastService.show('heslo.reset_heslo_success', 4000, 'green');
        this.dialogRef.close();
      }
    });
  }

}
