package cz.incad.nkp.inprove.old;


import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import cz.incad.nkp.inprove.old.Options;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
@Tag(name = "Search API", description = "API for flexible searching in Solr")
public class SearchApi {

    private ObjectMapper objectMapper;

    @GetMapping("**")
    public Map<String, Object> search(HttpServletRequest request) throws IOException {
        Options opts = Options.getInstance();
        int handlerIdx = request.getRequestURI().lastIndexOf("/") + 1;
        int solrIdx = request.getRequestURI().indexOf("/search/") + 8;
        String handler = request.getRequestURI().substring(handlerIdx);
        String core = request.getRequestURI().substring(solrIdx, handlerIdx);

        String solrhost = opts.getString("solrhost", "http://localhost:8983/solr/")
                + core  + handler + "?" + request.getQueryString().replace("\\+", "%2B");

        Map<String, String> reqProps = new HashMap<>();
        reqProps.put("Content-Type", "application/json");
        reqProps.put("Accept", "application/json");
        try (InputStream inputStream = inputStream(solrhost, reqProps)) {
            return objectMapper.readValue(inputStream, new TypeReference<Map<String, Object>>() {
            });
        }
    }

    private InputStream inputStream(String urlString, Map<String, String> reqProps) throws IOException {
        URLConnection uc = openConnection(urlString, reqProps);
        HttpURLConnection hcon = (HttpURLConnection) uc;
        hcon.setInstanceFollowRedirects(true);
        HttpURLConnection.setFollowRedirects(true);
        return uc.getInputStream();
    }

    private URLConnection openConnection(String urlString, Map<String, String> reqProps) throws MalformedURLException, IOException {
        URL url = new URL(urlString);
        URLConnection uc = url.openConnection();
        HttpURLConnection hcon = (HttpURLConnection) uc;
        hcon.setInstanceFollowRedirects(true);
        HttpURLConnection.setFollowRedirects(true);
        uc.setReadTimeout(Integer.parseInt("100000"));
        uc.setConnectTimeout(Integer.parseInt("10000"));
        for (Map.Entry<String, String> entry : reqProps.entrySet()) {
            uc.setRequestProperty(entry.getKey(), entry.getValue());
        }

        return uc;
    }

    @Autowired
    public void setObjectMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }
}
