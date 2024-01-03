package cz.incad.nkp.inprove.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        String forwardUrl = "forward:/index.html";
        registry.addViewController("").setViewName(forwardUrl);
        registry.addViewController("/").setViewName(forwardUrl);

        // allows all paths to forward to index.html except /api and /assets
        registry.addViewController("/{name:[b-zB-Z0-9][-a-zA-Z0-9]+}/**").setViewName(forwardUrl);
        registry.addViewController("/a{name:[a-oqrt-zA-OQRT-Z0-9]*}/**").setViewName(forwardUrl);
        registry.addViewController("/as{name:[a-rt-zA-RT-Z0-9]*}/**").setViewName(forwardUrl);
        registry.addViewController("/ap{name:[a-hj-zA-HJ-Z0-9]*}/**").setViewName(forwardUrl);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/assets**");
    }
}