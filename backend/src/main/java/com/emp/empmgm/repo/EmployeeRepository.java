package com.emp.empmgm.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.emp.empmgm.model.Employee;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

}
