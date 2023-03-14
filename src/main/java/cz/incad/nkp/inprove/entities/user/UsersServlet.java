/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package cz.incad.nkp.inprove.entities.user;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.InetAddress;
import java.util.HashSet;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.io.IOUtils;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author alberto
 */
@WebServlet(value = "/users/*")
public class UsersServlet extends HttpServlet {

  public static final Logger LOGGER = Logger.getLogger(UsersServlet.class.getName());
static boolean isLocalhost = false;

  /**
   * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
   * methods.
   *
   * @param req servlet request
   * @param resp servlet response
   * @throws ServletException if a servlet-specific error occurs
   * @throws IOException if an I/O error occurs
   */
  protected void processRequest(HttpServletRequest req, HttpServletResponse resp)
          throws ServletException, IOException {

    resp.setContentType("application/json;charset=UTF-8");
    resp.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1
    resp.setHeader("Pragma", "no-cache"); // HTTP 1.0
    resp.setDateHeader("Expires", 0); // Proxies.
    PrintWriter out = resp.getWriter();

    try {
      String actionNameParam = req.getPathInfo().substring(1);
      if (actionNameParam != null) {
        Set<String> localAddresses = new HashSet<>();
        localAddresses.add(InetAddress.getLocalHost().getHostAddress());
        for (InetAddress inetAddress : InetAddress.getAllByName("localhost")) {
          localAddresses.add(inetAddress.getHostAddress());
        }
        if (localAddresses.contains(req.getRemoteAddr())) {
          LOGGER.log(Level.FINE, "running from local address");
          isLocalhost = true;
        }

        Actions actionToDo = Actions.valueOf(actionNameParam.toUpperCase());
        //if (UsersController.isLogged(req) || isLocalhost) {
        out.print(actionToDo.doPerform(req, resp));
//        } else {
//          JSONObject json = new JSONObject();
//          json.put("error", "not logged");
//          out.print(json.toString());
//        }

      } else {
        out.print("actionNameParam -> " + actionNameParam);
      }
    } catch (IOException e1) {
      LOGGER.log(Level.SEVERE, e1.getMessage(), e1);
      resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e1.toString());
      out.print(e1.toString());
    } catch (SecurityException e1) {
      LOGGER.log(Level.SEVERE, e1.getMessage(), e1);
      resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
    } catch (Exception e1) {
      LOGGER.log(Level.SEVERE, e1.getMessage(), e1);
      resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e1.toString());
      out.print(e1.toString());
    }
  }

  enum Actions {
    ADD {
      @Override
      JSONObject doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

        JSONObject jo = new JSONObject();
        try {
          if (req.getMethod().equals("POST")) {
            String js = IOUtils.toString(req.getInputStream(), "UTF-8");
            jo = UsersService.add(new JSONObject(js));
          } else {
            jo = UsersService.add(new JSONObject(req.getParameter("json")));
          }

        } catch (Exception ex) {
          LOGGER.log(Level.SEVERE, null, ex);
          jo.put("logged", false);
          jo.put("error", ex.toString());
        }
        return jo;

      }
    },
    INITADMIN {
      @Override
      JSONObject doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

        JSONObject jo = new JSONObject();
        try {
          if (isLocalhost) {
          String pwd = req.getParameter("pwd");
          jo = UsersService.initAdmin(pwd);
          
          } else {
            jo.put("error", "Operation allowed only from localhost");
          }
        } catch (Exception ex) {
          LOGGER.log(Level.SEVERE, null, ex);
          jo.put("error", ex.toString());
        }
        return jo;

      }
    },
    SAVE {
      @Override
      JSONObject doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

        JSONObject jo = new JSONObject();
        try {
          JSONObject js;
          if (req.getMethod().equals("POST")) {
            js = new JSONObject(IOUtils.toString(req.getInputStream(), "UTF-8"));
          } else {
            js = new JSONObject(req.getParameter("json"));
          }
          
          if (js.has("id")) {
            jo = UsersService.save(js);
          } else {
            jo = UsersService.add(js);
          }
          

        } catch (Exception ex) {
          LOGGER.log(Level.SEVERE, null, ex);
          jo.put("error", ex.toString());
        }
        return jo;

      }
    },
    RESETPWD {
      @Override
      JSONObject doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

        JSONObject jo = new JSONObject();
        try {
          JSONObject js;
          if (req.getMethod().equals("POST")) {
            js = new JSONObject(IOUtils.toString(req.getInputStream(), "UTF-8"));
          } else {
            js = new JSONObject(req.getParameter("json"));
          }
          jo = UsersService.resetHeslo(js);

        } catch (Exception ex) {
          LOGGER.log(Level.SEVERE, null, ex);
          jo.put("error", ex.toString());
        }
        return jo;

      }
    },
    LOGIN {
      @Override
      JSONObject doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

        JSONObject jo = new JSONObject();
        try {
          String user = req.getParameter("username");
          String pwd = req.getParameter("password");
          if (req.getMethod().equals("POST")) {
            JSONObject js = new JSONObject(IOUtils.toString(req.getInputStream(), "UTF-8"));
            user = js.getString("username");
            pwd = js.getString("password");
          }

          if (user != null) {
            JSONObject j = UsersService.login(req, user, pwd);
            if (j != null) {
              jo.put("logged", true);
              jo.put("user", j);

            } else {
              //resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
              jo.put("logged", false);
              jo.put("error", "invalid user name or password");
            }

          } else {
            //resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            jo.put("logged", false);
            jo.put("error", "invalid user name or password");
          }

        } catch (Exception ex) {
          LOGGER.log(Level.WARNING, null, ex);
          jo.put("logged", false);
          jo.put("error", ex.toString());
        }
        return jo;

      }
    },
    LOGOUT {
      @Override
      JSONObject doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        JSONObject jo = new JSONObject();
        try {
          req.getSession().invalidate();
          jo.put("msg", "logged out");

        } catch (Exception ex) {
          jo.put("error", ex.toString());
        }
        return jo;

      }
    },
    ALL {
      @Override
      JSONObject doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

        JSONObject jo = UsersService.getAll();
        return jo;

      }
    },
    CHECK {
      @Override
      JSONObject doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        JSONObject jo = UsersService.exists(req.getParameter("username"));
        return jo;
      }
    },
    TESTLOGIN {
      @Override
      JSONObject doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        JSONObject jo = new JSONObject();
        try {
          jo = (JSONObject) UsersService.get(req);
          if (jo == null) {
            jo = new JSONObject();
            jo.put("error", "nologged");
          }

        } catch (Exception ex) {
          jo.put("error", ex.toString());
        }
        return jo;
      }
    },
    INFO {
      @Override
      JSONObject doPerform(HttpServletRequest req, HttpServletResponse response) throws Exception {
        JSONObject jo = new JSONObject();
        try {
          jo = UsersService.getOne(req.getParameter("code"), false);
        } catch (JSONException ex) {
          LOGGER.log(Level.SEVERE, null, ex);
          jo.put("error", ex.toString());
        }
        return jo;
      }
    };

    abstract JSONObject doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception;
  }

  // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
  /**
   * Handles the HTTP <code>GET</code> method.
   *
   * @param request servlet request
   * @param response servlet response
   * @throws ServletException if a servlet-specific error occurs
   * @throws IOException if an I/O error occurs
   */
  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
          throws ServletException, IOException {
    processRequest(request, response);
  }

  /**
   * Handles the HTTP <code>POST</code> method.
   *
   * @param request servlet request
   * @param response servlet response
   * @throws ServletException if a servlet-specific error occurs
   * @throws IOException if an I/O error occurs
   */
  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response)
          throws ServletException, IOException {
    processRequest(request, response);
  }

  /**
   * Returns a short description of the servlet.
   *
   * @return a String containing servlet description
   */
  @Override
  public String getServletInfo() {
    return "Short description";
  }// </editor-fold>

}
