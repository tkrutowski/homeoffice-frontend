FROM adoptopenjdk/openjdk11:jdk-11.0.2.7-alpine-slim
COPY java.security /opt/java/openjdk/conf/security
COPY target/homeoffice-0.1.4.jar .
COPY src/main/resources ./src/main/resources
EXPOSE 8077
CMD  java -jar homeoffice-0.1.4.jar
