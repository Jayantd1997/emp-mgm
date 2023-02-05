package com.emp.empmgm.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.emp.empmgm.model.Employee;
import com.emp.empmgm.repo.EmployeeRepository;

@RestController
public class EmployeeController {
	
	@Autowired
	EmployeeRepository repository;
	
	@GetMapping(value = "/employees")
	public List<Employee> getEmployees(){
		return repository.findAll();
	}

}
