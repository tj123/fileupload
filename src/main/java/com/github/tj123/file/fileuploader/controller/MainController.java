package com.github.tj123.file.fileuploader.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by TJ on 2017/7/7.
 */
@Controller
@RequestMapping
public class MainController {

    @ResponseBody
    @RequestMapping(value = "/upload")
    public String index(MultipartFile file) throws JsonProcessingException {


        System.out.println(file);

        Map<String,Object> map = new HashMap<>();


        map.put("hehe","asdfasefef");
        map.put("hehew","asdfasefef");
        map.put("hehe2w","asdfasefef");
        map.put("hehee","asdfasefef");


        return new ObjectMapper().writeValueAsString(map);

    }


}
