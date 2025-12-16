// services/settingsServices/index.js

import OrganizationProfileService from "./OrganizationProfileService";
import DepartmentsService from "./DepartmentsService";
import RolesService from "./RolesService";
import TasksService from "./TasksService";
import FabricsService from "./FabricsService";
import InvoiceSettingsService from "./InvoiceSettingsService";

const SettingsService = {
  Profile: OrganizationProfileService,
  Departments: DepartmentsService,
  Roles: RolesService,
  Tasks: TasksService,
  Fabrics: FabricsService,
  Invoice: InvoiceSettingsService,
};

export default SettingsService;

// Named exports for individual services
export {
  OrganizationProfileService,
  DepartmentsService,
  RolesService,
  TasksService,
  FabricsService,
  InvoiceSettingsService,
};