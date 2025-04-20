<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <!-- Parameters for user level and selected title -->
    <!-- Parameters for user level, selected title, and selected theme -->
    <xsl:param name="userLevel" select="'Intermediate'" />
    <xsl:param name="selectedTitle" select="''" />
    <xsl:param name="selectedTheme" select="''" />


    <xsl:template match="/books">
        <html>
            <head>
                <style>
                    body {
                    font-family: 'Raleway', sans-serif;
                    background: #f9f4ff;
                    padding: 2rem;
                    }

                    h2 {
                    color: #6a0572;
                    margin-bottom: 1.5rem;
                    }

                    .book {
                    background: white;
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 10px rgba(100, 0, 150, 0.1);
                    transition: transform 0.2s ease;
                    text-align: left;
                    margin-bottom: 1.5rem;
                    width: 100%;
                    box-sizing: border-box;
                    }

                    .book:hover {
                    transform: translateY(-4px);
                    }

                    .book h3 {
                    font-size: 1.2rem;
                    margin-bottom: 0.5rem;
                    color: #6a0572;
                    }

                    .details {
                    margin-top: 0.5rem;
                    padding-left: 1rem;
                    color: #555;
                    font-size: 0.95rem;
                    }

                    .match {
                    background-color: #fff3d0; /* soft yellow-beige */
                    }

                    .no-match {
                    background-color: #e9fce9; /* pastel green */
                    }
                </style>
            </head>
            <body>
                <xsl:for-each select="book">
                    <xsl:if test="$selectedTheme = '' or themes/theme = $selectedTheme">

                    <xsl:variable name="isMatch" select="levels/level = $userLevel" />
                    <xsl:variable name="titleText" select="title" />

                    <div>
                        <xsl:attribute name="class">
                            <xsl:text>book </xsl:text>
                            <xsl:choose>
                                <xsl:when test="$isMatch">match</xsl:when>
                                <xsl:otherwise>no-match</xsl:otherwise>
                            </xsl:choose>
                        </xsl:attribute>

                        <h3><xsl:value-of select="title"/></h3>

                        <!-- Show extra details if this is the selected book -->
                        <xsl:if test="$titleText = $selectedTitle">
                            <div class="details">
                                <p><strong>Themes:</strong>
                                    <xsl:for-each select="themes/theme">
                                        <xsl:value-of select="."/>
                                        <xsl:if test="position() != last()">, </xsl:if>
                                    </xsl:for-each>
                                </p>
                                <p><strong>Levels:</strong>
                                    <xsl:for-each select="levels/level">
                                        <xsl:value-of select="."/>
                                        <xsl:if test="position() != last()">, </xsl:if>
                                    </xsl:for-each>
                                </p>
                            </div>
                        </xsl:if>
                    </div>
                    </xsl:if>
                </xsl:for-each>


            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
