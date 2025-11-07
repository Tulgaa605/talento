// Shared data fetching utilities for HR module

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface Position {
  id: string;
  title: string;
  code: string;
  description: string;
  departmentId: string;
  department: Department;
}

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phoneNumber: string;
  status: string;
  hireDate: string;
  position?: Position;
  department?: Department;
}

/**
 * Fetch all departments
 */
export async function fetchDepartments(): Promise<Department[]> {
  try {
    const response = await fetch('/api/hr/departments');
    if (response.ok) {
      return await response.json();
    }
    console.error('Failed to fetch departments');
    return [];
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
}

/**
 * Fetch all positions or filter by department
 */
export async function fetchPositions(departmentId?: string): Promise<Position[]> {
  try {
    const url = departmentId 
      ? `/api/hr/positions?departmentId=${departmentId}`
      : '/api/hr/positions';
    const response = await fetch(url);
    if (response.ok) {
      return await response.json();
    }
    console.error('Failed to fetch positions');
    return [];
  } catch (error) {
    console.error('Error fetching positions:', error);
    return [];
  }
}

/**
 * Fetch all employees or filter by status
 */
export async function fetchEmployees(status?: string): Promise<Employee[]> {
  try {
    const url = status 
      ? `/api/hr/employees?status=${status}`
      : '/api/hr/employees';
    const response = await fetch(url);
    if (response.ok) {
      return await response.json();
    }
    console.error('Failed to fetch employees');
    return [];
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
}

