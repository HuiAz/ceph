import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl } from '@angular/forms';
import { By } from '@angular/platform-browser';

import * as _ from 'lodash';

import { TableActionsComponent } from '../app/shared/datatable/table-actions/table-actions.component';
import { CdFormGroup } from '../app/shared/forms/cd-form-group';
import { Permission } from '../app/shared/models/permissions';
import { _DEV_ } from '../unit-test-configuration';

export function configureTestBed(configuration, useOldMethod?) {
  if (_DEV_ && !useOldMethod) {
    const resetTestingModule = TestBed.resetTestingModule;
    beforeAll((done) =>
      (async () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule(configuration);
        // prevent Angular from resetting testing module
        TestBed.resetTestingModule = () => TestBed;
      })()
        .then(done)
        .catch(done.fail));
    afterAll(() => {
      TestBed.resetTestingModule = resetTestingModule;
    });
  } else {
    beforeEach(async(() => {
      TestBed.configureTestingModule(configuration);
    }));
  }
}

export class PermissionHelper {
  tableActions: TableActionsComponent;
  permission: Permission;
  getTableActionComponent: () => TableActionsComponent;

  constructor(permission: Permission, getTableActionComponent: () => TableActionsComponent) {
    this.permission = permission;
    this.getTableActionComponent = getTableActionComponent;
  }

  setPermissionsAndGetActions(
    createPerm: number | boolean,
    updatePerm: number | boolean,
    deletePerm: number | boolean
  ): TableActionsComponent {
    this.permission.create = Boolean(createPerm);
    this.permission.update = Boolean(updatePerm);
    this.permission.delete = Boolean(deletePerm);
    this.tableActions = this.getTableActionComponent();
    return this.tableActions;
  }

  testScenarios({
    fn,
    empty,
    single,
    singleExecuting,
    multiple
  }: {
    fn: () => any;
    empty: any;
    single: any;
    singleExecuting?: any; // uses 'single' if not defined
    multiple?: any; // uses 'empty' if not defined
  }) {
    this.testScenario(
      // 'multiple selections'
      [{}, {}],
      fn,
      _.isUndefined(multiple) ? empty : multiple
    );
    this.testScenario(
      // 'select executing item'
      [{ cdExecuting: 'someAction' }],
      fn,
      _.isUndefined(singleExecuting) ? single : singleExecuting
    );
    this.testScenario([{}], fn, single); // 'select non-executing item'
    this.testScenario([], fn, empty); // 'no selection'
  }

  private testScenario(selection: object[], fn: () => any, expected: any) {
    this.setSelection(selection);
    expect(fn()).toBe(expected);
  }

  setSelection(selection: object[]) {
    this.tableActions.selection.selected = selection;
    this.tableActions.selection.update();
  }
}

export class FormHelper {
  form: CdFormGroup;

  constructor(form: CdFormGroup) {
    this.form = form;
  }

  /**
   * Changes multiple values in multiple controls
   */
  setMultipleValues(values: { [controlName: string]: any }, markAsDirty?: boolean) {
    Object.keys(values).forEach((key) => {
      this.setValue(key, values[key], markAsDirty);
    });
  }

  /**
   * Changes the value of a control
   */
  setValue(control: AbstractControl | string, value: any, markAsDirty?: boolean): AbstractControl {
    control = this.getControl(control);
    if (markAsDirty) {
      control.markAsDirty();
    }
    control.setValue(value);
    return control;
  }

  private getControl(control: AbstractControl | string): AbstractControl {
    if (typeof control === 'string') {
      return this.form.get(control);
    }
    return control;
  }

  /**
   * Change the value of the control and expect the control to be valid afterwards.
   */
  expectValidChange(control: AbstractControl | string, value: any, markAsDirty?: boolean) {
    this.expectValid(this.setValue(control, value, markAsDirty));
  }

  /**
   * Expect that the given control is valid.
   */
  expectValid(control: AbstractControl | string) {
    // 'isValid' would be false for disabled controls
    expect(this.getControl(control).errors).toBe(null);
  }

  /**
   * Change the value of the control and expect a specific error.
   */
  expectErrorChange(
    control: AbstractControl | string,
    value: any,
    error: string,
    markAsDirty?: boolean
  ) {
    this.expectError(this.setValue(control, value, markAsDirty), error);
  }

  /**
   * Expect a specific error for the given control.
   */
  expectError(control: AbstractControl | string, error: string) {
    expect(this.getControl(control).hasError(error)).toBeTruthy();
  }

  /**
   * Expect a list of id elements to be visible or not.
   */
  expectIdElementsVisible(fixture: ComponentFixture<any>, ids: string[], visibility: boolean) {
    fixture.detectChanges();
    ids.forEach((css) => {
      this.expectElementVisible(fixture, `#${css}`, visibility);
    });
  }

  /**
   * Expect a specific element in fixture to be visible or not.
   */
  expectElementVisible(fixture: ComponentFixture<any>, css: string, visibility: boolean) {
    expect(Boolean(fixture.debugElement.query(By.css(css)))).toBe(visibility);
  }
}