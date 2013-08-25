package org.lenition.filter;

import com.sun.jersey.spi.container.ContainerRequest;
import com.sun.jersey.spi.container.ContainerResponse;
import com.sun.jersey.spi.container.ContainerResponseFilter;

/**
 * Jersey filter to allow CORS.
 */
public class AllowOriginFilter implements ContainerResponseFilter {

    /**
     * Add Access-Control-Allow-* headers to response.
     * @param request request with headers
     * @param response response to add headers to
     * @return response with modified headers
     */
    @Override
    public ContainerResponse filter(ContainerRequest request, ContainerResponse response) {
        response.getHttpHeaders().putSingle("Access-Control-Allow-Origin", "*");
        response.getHttpHeaders().putSingle("Access-Control-Allow-Credentials", "true");
        response.getHttpHeaders().putSingle("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
        response.getHttpHeaders().putSingle("Access-Control-Allow-Headers",
                request.getHeaderValue("Access-Control-Request-Headers"));
        return response;
    }
}
