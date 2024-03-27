FROM adoptopenjdk/openjdk11:jdk-11.0.2.7-alpine-slim
COPY java.security /opt/java/openjdk/conf/security
COPY target/homeoffice-1.0.0.jar .
COPY src/main/resources ./src/main/resources
EXPOSE 8088
CMD  java -jar homeoffice-1.0.0.jar
