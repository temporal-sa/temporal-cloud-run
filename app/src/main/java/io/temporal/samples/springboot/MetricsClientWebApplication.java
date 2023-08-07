package io.temporal.samples.springboot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MetricsClientWebApplication {

    public static void main(String[] args)  {
        SpringApplication.run(MetricsClientWebApplication.class, args).start();
//        WorkflowServiceStubs service = WorkflowServiceStubs.newLocalServiceStubs();
//        WorkflowClient client = WorkflowClient.newInstance(service);
//        WorkerFactory factory = WorkerFactory.newInstance(client);
//        Worker worker = factory.newWorker(Common.QUEUE_NAME);
//        worker.registerWorkflowImplementationTypes(MetricWorkflowImpl.class);
//        worker.registerActivitiesImplementations(new MetricActivityImpl());
//        factory.start();
    }
}
