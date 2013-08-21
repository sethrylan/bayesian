package org.lenition.filter;

import com.sun.jersey.spi.container.ContainerRequest;
import com.sun.jersey.spi.container.ContainerResponse;
import com.sun.jersey.spi.container.ContainerResponseFilter;

public class AllowOriginFilter implements ContainerResponseFilter {

    @Override
    public ContainerResponse filter(ContainerRequest request, ContainerResponse response) {
        response.getHttpHeaders().putSingle("Access-Control-Allow-Origin", "*");
        response.getHttpHeaders().putSingle("Access-Control-Allow-Credentials", "true");
        response.getHttpHeaders().putSingle("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
        response.getHttpHeaders().putSingle("Access-Control-Allow-Headers", request.getHeaderValue("Access-Control-Request-Headers"));
        return response;
    }
}
