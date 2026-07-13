package com.sonabel.cmt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class CmtApplication {

    public static void main(String[] args) {
        SpringApplication.run(CmtApplication.class, args);
    }
}
