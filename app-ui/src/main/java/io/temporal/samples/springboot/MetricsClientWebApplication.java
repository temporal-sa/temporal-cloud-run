package io.temporal.samples.springboot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MetricsClientWebApplication {

    public static void main(String[] args)  {
        SpringApplication.run(MetricsClientWebApplication.class, args).start();
    }
}
