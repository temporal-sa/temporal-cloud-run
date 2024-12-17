package io.temporal.samples.springboot.hello;

public class WorkflowInput {
    private String input;

    public WorkflowInput(String input) {
        this.input = input;
    }

    public WorkflowInput() {
        this.input = "";
    }

    public String getInput() {
        return input;
    }
    public void setInput(String input) {
        this.input = input;
    }
}