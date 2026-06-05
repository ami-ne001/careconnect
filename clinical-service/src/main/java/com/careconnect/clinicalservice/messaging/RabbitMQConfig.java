package com.careconnect.clinicalservice.messaging;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "careconnect-exchange";
    
    public static final String PATIENT_ADMITTED_QUEUE = "clinical-patient-admitted-queue";
    public static final String LAB_RESULT_UPLOADED_QUEUE = "clinical-lab-result-uploaded-queue";
    public static final String DOCTOR_USER_CREATED_QUEUE = "clinical-doctor-user-created-queue";
    
    public static final String ROUTING_KEY_PATIENT_ADMITTED = "patient.admitted";
    public static final String ROUTING_KEY_LAB_RESULT_UPLOADED = "lab.result.uploaded";
    public static final String ROUTING_KEY_DOCTOR_USER_CREATED = "doctor.user.created";
    public static final String ROUTING_KEY_CONSULTATION_CLOSED = "consultation.closed";
    public static final String ROUTING_KEY_SURGERY_SCHEDULED = "surgery.scheduled";
    public static final String ROUTING_KEY_SURGERY_BILLED = "surgery.billed";

    @Bean
    public TopicExchange careConnectExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Queue patientAdmittedQueue() {
        return new Queue(PATIENT_ADMITTED_QUEUE, true);
    }

    @Bean
    public Queue labResultUploadedQueue() {
        return new Queue(LAB_RESULT_UPLOADED_QUEUE, true);
    }

    @Bean
    public Queue doctorUserCreatedQueue() {
        return new Queue(DOCTOR_USER_CREATED_QUEUE, true);
    }

    @Bean
    public Binding bindingPatientAdmitted(Queue patientAdmittedQueue, TopicExchange careConnectExchange) {
        return BindingBuilder.bind(patientAdmittedQueue).to(careConnectExchange).with(ROUTING_KEY_PATIENT_ADMITTED);
    }

    @Bean
    public Binding bindingLabResultUploaded(Queue labResultUploadedQueue, TopicExchange careConnectExchange) {
        return BindingBuilder.bind(labResultUploadedQueue).to(careConnectExchange).with(ROUTING_KEY_LAB_RESULT_UPLOADED);
    }

    @Bean
    public Binding bindingDoctorUserCreated(Queue doctorUserCreatedQueue, TopicExchange careConnectExchange) {
        return BindingBuilder.bind(doctorUserCreatedQueue).to(careConnectExchange).with(ROUTING_KEY_DOCTOR_USER_CREATED);
    }

    @Bean
    public JacksonJsonMessageConverter messageConverter() {
        return new JacksonJsonMessageConverter();
    }
}
