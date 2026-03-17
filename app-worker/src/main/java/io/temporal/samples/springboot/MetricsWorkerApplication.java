package io.temporal.samples.springboot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MetricsWorkerApplication {

    public static void main(String[] args) {
        SpringApplication.run(MetricsWorkerApplication.class, args).start();
    }
}
